import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { clearChatHistory, sendChatMessage } from "@/api/chatbotApi";
import type { ChatMessage } from "@/types";

const GREETING =
  'Xin chào! Tôi là trợ lý sách của cửa hàng. Bạn có thể hỏi theo thể loại, giá hoặc tình trạng còn hàng — ví dụ "manga dưới 15 còn hàng" — và hỏi tiếp về những cuốn tôi vừa gợi ý.';

/**
 * Chat state for the advisor widget.
 *
 * The conversation thread itself lives on the server, keyed by user, so this
 * store only holds what the widget renders. It deliberately exposes a single
 * `send` action: the previous version carried a parallel `sendMessage` that
 * read a `reply` field the API never returned, alongside state for a reading
 * analysis feature that was never built.
 */
export const useChatbotStore = defineStore("chatbot", () => {
  const messages = ref<ChatMessage[]>([]);
  const isTyping = ref(false);
  const isChatbotOpen = ref(false);
  const error = ref<string | null>(null);

  const hasMessages = computed(() => messages.value.length > 0);

  function addMessage(message: Omit<ChatMessage, "id" | "timestamp">) {
    messages.value.push({ ...message, id: Date.now(), timestamp: new Date() });
  }

  /** Seeds the greeting, but only once — reopening the widget keeps the thread. */
  function initializeChatbot() {
    if (!messages.value.length) addMessage({ type: "bot", text: GREETING });
  }

  async function send(message: string) {
    const text = message.trim();
    if (!text || isTyping.value) return;

    addMessage({ type: "user", text });
    isTyping.value = true;
    error.value = null;

    try {
      const { reply, books } = await sendChatMessage(text);
      addMessage({ type: "bot", text: reply, books });
    } catch (err: any) {
      // The backend already returns a readable sentence for rate limits, quota
      // and overload, so prefer it over a generic message.
      const message =
        err?.message ?? "Tôi gặp lỗi khi xử lý tin nhắn. Bạn thử lại nhé.";
      error.value = message;
      addMessage({ type: "bot", text: message, failed: true });
    } finally {
      isTyping.value = false;
    }
  }

  /** Clears the thread on both sides so the next message starts fresh. */
  async function resetConversation() {
    messages.value = [];
    error.value = null;
    try {
      await clearChatHistory();
    } catch {
      // A failed clear only leaves stale context on the server; the user still
      // gets an empty window, so there is nothing useful to report here.
    }
    initializeChatbot();
  }

  function toggleChatbot() {
    isChatbotOpen.value = !isChatbotOpen.value;
  }

  function closeChatbot() {
    isChatbotOpen.value = false;
  }

  return {
    messages,
    isTyping,
    isChatbotOpen,
    error,
    hasMessages,
    addMessage,
    initializeChatbot,
    send,
    resetConversation,
    toggleChatbot,
    closeChatbot,
  };
});
