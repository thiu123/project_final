import {
  Content,
  FunctionCall,
  GenerativeModel,
  GoogleGenerativeAI,
  Part,
  Tool,
} from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Models tried in order, overridable via a comma-separated GEMINI_MODEL.
 *
 * The list matters as much as the names: the free tier caps requests per model
 * per day, so one model alone runs out fast. Google also retires model IDs
 * without notice, which is the other reason this is configuration, not code.
 */
const DEFAULT_GEMINI_MODELS =
  'gemini-3.6-flash,gemini-3.5-flash,gemini-3.1-flash-lite';

/** How long an out-of-quota model is skipped before being tried again. */
const QUOTA_COOLDOWN_MS = 15 * 60 * 1000;

/**
 * Minimum spacing between calls. Gemini's rate limit is per API key, not per
 * user, so the gap has to be enforced globally for the whole process.
 */
const DEFAULT_MIN_GAP_MS = 1000;

/**
 * How many callers may wait in the pacing queue. Past this the request fails
 * fast with a friendly message instead of leaving the user staring at a
 * spinner for however long the backlog takes to drain.
 */
const MAX_QUEUE_DEPTH = 8;

/** Safety net: stop after this many tool round trips even if the model keeps asking. */
const MAX_TOOL_ROUNDS = 3;

/** Pause before the single retry of an overloaded call. */
const OVERLOAD_RETRY_DELAY_MS = 1500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiQuotaError extends Error {}
export class GeminiBusyError extends Error {}

const messageOf = (error: unknown): string => (error as Error)?.message ?? '';

export const isQuotaError = (error: unknown): boolean => {
  const message = messageOf(error);
  return (
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('Too Many Requests')
  );
};

/**
 * A retired model answers 404 forever, so it must not be mistaken for a
 * transient failure — it needs a config change, and the log has to say so.
 */
export const isModelGoneError = (error: unknown): boolean => {
  const message = messageOf(error);
  return message.includes('404') && message.includes('models/');
};

/** Google's own capacity limit, distinct from our quota. Retrying usually works. */
export const isOverloadedError = (error: unknown): boolean => {
  const message = messageOf(error);
  return message.includes('503') || message.includes('high demand');
};

export interface ToolTurn {
  /** Prior turns, oldest first. Passed straight to the SDK as chat history. */
  history: Content[];
  message: string;
  systemInstruction: string;
  tools: Tool[];
  /** Runs one model-requested call and returns the JSON payload to send back. */
  executor: (call: FunctionCall) => Promise<object>;
}

export interface ToolTurnResult {
  text: string;
  history: Content[];
  toolCalls: FunctionCall[];
  /** Number of Gemini round trips this turn actually cost. */
  llmCalls: number;
}

/**
 * Thin wrapper around the Gemini SDK that owns two things the callers should
 * not each reinvent: request pacing and the tool-calling loop.
 */
@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelNames: string[];
  private readonly minGapMs: number;

  /** Model name → when its quota cooldown expires. */
  private readonly exhausted = new Map<string, number>();

  /**
   * Calls are chained onto this promise so they run one at a time. The old
   * implementation compared timestamps without serializing, so concurrent
   * callers all passed the check together and then fired as one burst — it
   * added latency without ever spacing anything out.
   */
  private queue: Promise<unknown> = Promise.resolve();
  private queueDepth = 0;
  private lastCall = 0;

  constructor(configService: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      configService.get<string>('GEMINI_KEY') ?? '',
    );
    this.modelNames = (
      configService.get<string>('GEMINI_MODEL') || DEFAULT_GEMINI_MODELS
    )
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
    this.minGapMs =
      Number(configService.get<string>('GEMINI_MIN_GAP_MS')) ||
      DEFAULT_MIN_GAP_MS;

    this.logger.log(`Gemini models, in order: ${this.modelNames.join(' → ')}`);
  }

  private model(
    name: string,
    systemInstruction?: string,
    tools?: Tool[],
  ): GenerativeModel {
    return this.genAI.getGenerativeModel({
      model: name,
      ...(systemInstruction && { systemInstruction }),
      ...(tools && { tools }),
    });
  }

  /** Models not currently sitting out a quota cooldown, in preference order. */
  private availableModels(): string[] {
    const now = Date.now();
    const ready = this.modelNames.filter(
      (name) => (this.exhausted.get(name) ?? 0) <= now,
    );
    // Everything is cooling down: try them all anyway rather than refusing
    // outright, since a cooldown is a guess and the quota may have reset.
    return ready.length ? ready : this.modelNames;
  }

  /**
   * Serializes calls and waits only the time still missing from the gap — the
   * previous code slept the full delay every time, even when the gap had
   * already elapsed.
   */
  private paced<T>(run: () => Promise<T>): Promise<T> {
    if (this.queueDepth >= MAX_QUEUE_DEPTH) {
      return Promise.reject(
        new GeminiBusyError('Too many chat requests are already queued'),
      );
    }

    this.queueDepth += 1;
    const result = this.queue.then(async () => {
      const wait = this.minGapMs - (Date.now() - this.lastCall);
      if (wait > 0) await sleep(wait);
      this.lastCall = Date.now();
      return run();
    });

    // Swallow rejections on the chain itself so one failure does not poison
    // every call queued behind it; the caller still sees its own error.
    this.queue = result.catch(() => undefined);
    return result.finally(() => {
      this.queueDepth -= 1;
    }) as Promise<T>;
  }

  /**
   * Runs a call against the first model that works.
   *
   * The free tier's cap is per model per day — 20/day for gemini-3.6-flash at
   * the time of writing — so a single model runs dry quickly. Each model has
   * its own budget, and falling through to the next multiplies the daily
   * allowance at no cost. An exhausted model is put on a cooldown so later
   * requests skip it instead of paying a round trip to be told 429 again.
   *
   * A 503 is different: Google is busy, not us, so that one is retried on the
   * same model rather than moving on.
   */
  private async attempt<T>(run: (model: string) => Promise<T>): Promise<T> {
    const models = this.availableModels();
    let lastQuotaError: unknown;

    for (const name of models) {
      try {
        return await this.paced(() => run(name));
      } catch (error) {
        if (isOverloadedError(error)) {
          this.logger.warn(`${name} reported high demand; retrying once.`);
          await sleep(OVERLOAD_RETRY_DELAY_MS);
          try {
            return await this.paced(() => run(name));
          } catch (retryError) {
            if (!isQuotaError(retryError)) throw retryError;
            lastQuotaError = retryError;
            this.markExhausted(name);
            continue;
          }
        }

        if (!isQuotaError(error)) throw error;
        lastQuotaError = error;
        this.markExhausted(name);
      }
    }

    throw lastQuotaError ?? new GeminiQuotaError('No Gemini model available');
  }

  private markExhausted(name: string): void {
    this.exhausted.set(name, Date.now() + QUOTA_COOLDOWN_MS);
    this.logger.warn(
      `${name} is out of quota; skipping it for ${QUOTA_COOLDOWN_MS / 60000} min.`,
    );
  }

  private rethrow(error: unknown): never {
    if (isModelGoneError(error)) {
      this.logger.error(
        `A configured Gemini model no longer exists. Update GEMINI_MODEL (currently: ${this.modelNames.join(', ')}).`,
      );
    }
    if (isQuotaError(error)) throw new GeminiQuotaError(messageOf(error));
    if (isOverloadedError(error)) {
      throw new GeminiBusyError('Gemini is overloaded');
    }
    throw error;
  }

  /** Single-shot completion with no tools and no history. */
  async generate(prompt: string, systemInstruction?: string): Promise<string> {
    try {
      const result = await this.attempt((name) =>
        this.model(name, systemInstruction).generateContent(prompt),
      );
      return result.response.text().trim();
    } catch (error) {
      this.rethrow(error);
    }
  }

  /**
   * Runs one conversational turn, letting the model call the provided tools.
   *
   * A turn costs one Gemini call when the model can answer from history alone
   * (follow-ups, greetings) and two when it needs a catalogue lookup. Gemini
   * may request several tools in a single round, so a multi-criteria question
   * still costs two rather than one call per criterion.
   */
  async runTurn({
    history,
    message,
    systemInstruction,
    tools,
    executor,
  }: ToolTurn): Promise<ToolTurnResult> {
    try {
      // The turn is driven with explicit `contents` rather than `startChat`
      // because the SDK labels tool results with the role "function", which
      // current Gemini models reject; sent as "user" they are accepted.
      const contents: Content[] = [
        ...history,
        { role: 'user', parts: [{ text: message }] },
      ];

      let result = await this.attempt((name) =>
        this.model(name, systemInstruction, tools).generateContent({
          contents,
        }),
      );
      let llmCalls = 1;
      const toolCalls: FunctionCall[] = [];

      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        const calls = result.response.functionCalls();
        if (!calls?.length) break;

        toolCalls.push(...calls);
        const parts: Part[] = await Promise.all(
          calls.map(async (call) => ({
            functionResponse: {
              name: call.name,
              response: await executor(call),
            },
          })),
        );

        const requested = result.response.candidates?.[0]?.content;
        if (requested) contents.push(requested);
        contents.push({ role: 'user', parts });

        result = await this.attempt((name) =>
          this.model(name, systemInstruction, tools).generateContent({
            contents,
          }),
        );
        llmCalls += 1;
      }

      return {
        text: result.response.text().trim(),
        history: contents,
        toolCalls,
        llmCalls,
      };
    } catch (error) {
      this.rethrow(error);
    }
  }
}
