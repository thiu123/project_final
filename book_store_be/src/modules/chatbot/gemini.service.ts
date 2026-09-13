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

// The free tier caps requests per model per day, so one model runs out fast.
// Google also retires model ids without notice, hence the env override.
const DEFAULT_GEMINI_MODELS =
  'gemini-3.6-flash,gemini-3.5-flash,gemini-3.1-flash-lite';

const QUOTA_COOLDOWN_MS = 15 * 60 * 1000;
const DEFAULT_MIN_GAP_MS = 1000;
const MAX_QUEUE_DEPTH = 8;
const MAX_TOOL_ROUNDS = 3;
const OVERLOAD_RETRY_DELAY_MS = 1500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class GeminiQuotaError extends Error {}
export class GeminiBusyError extends Error {}

const messageOf = (error: unknown): string => (error as Error)?.message ?? '';

const isQuotaError = (error: unknown): boolean => {
  const message = messageOf(error);
  return (
    message.includes('429') ||
    message.includes('quota') ||
    message.includes('Too Many Requests')
  );
};

// A retired model answers 404 forever, so it needs a config change, not a retry.
const isModelGoneError = (error: unknown): boolean => {
  const message = messageOf(error);
  return message.includes('404') && message.includes('models/');
};

// Google is busy, not us: retrying the same model usually works.
const isOverloadedError = (error: unknown): boolean => {
  const message = messageOf(error);
  return message.includes('503') || message.includes('high demand');
};

export interface ToolTurn {
  history: Content[];
  message: string;
  systemInstruction: string;
  tools: Tool[];
  executor: (call: FunctionCall) => Promise<object>;
}

export interface ToolTurnResult {
  text: string;
  llmCalls: number;
  toolCalls: number;
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly modelNames: string[];
  private readonly minGapMs: number;

  // Model name -> when its quota cooldown expires.
  private readonly exhausted = new Map<string, number>();

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

  // One conversational turn. Costs one Gemini call when the model answers from
  // history alone, two when it needs a catalogue lookup.
  async runTurn({
    history,
    message,
    systemInstruction,
    tools,
    executor,
  }: ToolTurn): Promise<ToolTurnResult> {
    try {
      // Driven with explicit `contents` instead of `startChat`: the SDK labels
      // tool results with the role "function", which current models reject.
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
      let toolCalls = 0;

      for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
        const calls = result.response.functionCalls();
        if (!calls?.length) break;

        toolCalls += calls.length;
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

      return { text: result.response.text().trim(), llmCalls, toolCalls };
    } catch (error) {
      this.rethrow(error);
    }
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

  // Runs a call against the first model that works. Each model has its own
  // daily budget, so falling through multiplies the free allowance.
  private async attempt<T>(run: (model: string) => Promise<T>): Promise<T> {
    let lastQuotaError: unknown;

    for (const name of this.availableModels()) {
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

  private availableModels(): string[] {
    const now = Date.now();
    const ready = this.modelNames.filter(
      (name) => (this.exhausted.get(name) ?? 0) <= now,
    );
    // Everything is cooling down: try them all anyway, the quota may have reset.
    return ready.length ? ready : this.modelNames;
  }

  // Gemini rate-limits per API key, so calls run one at a time with a minimum
  // gap between them, for the whole process.
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

    // Swallow rejections on the chain so one failure does not poison the
    // calls queued behind it; the caller still sees its own error.
    this.queue = result.catch(() => undefined);
    return result.finally(() => {
      this.queueDepth -= 1;
    }) as Promise<T>;
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
}
