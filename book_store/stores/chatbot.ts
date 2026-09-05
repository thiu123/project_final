import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getBookSuggestions as getBookSuggestionsApi, generateSmartReview } from "@/api/chatbotApi";
import type { ChatMessage } from "@/types";

export const useChatbotStore = defineStore("chatbot", () => {
  // Chat state
  const messages = ref<ChatMessage[]>([]);
  const isTyping = ref(false);
  const chatContext = ref("");

  // Suggestions state
  const suggestions = ref<any[]>([]);
  const loadingSuggestions = ref(false);

  // Review state
  const generatedReview = ref<any | null>(null);
  const loadingReview = ref(false);

  // Analysis state
  const readingAnalysis = ref<any | null>(null);
  const loadingAnalysis = ref(false);

  // UI state
  const isChatbotOpen = ref(false);
  const activeTab = ref("chat");

  // Error handling
  const error = ref<string | null>(null);

  // Getters
  const recentMessages = computed(() => messages.value.slice(-10));
  const hasMessages = computed(() => messages.value.length > 0);
  const hasSuggestions = computed(() => suggestions.value.length > 0);
  const hasGeneratedReview = computed(() => !!generatedReview.value);
  const hasAnalysis = computed(() => !!readingAnalysis.value);
  const isLoading = computed(
    () =>
      isTyping.value ||
      loadingSuggestions.value ||
      loadingReview.value ||
      loadingAnalysis.value
  );
  const hasError = computed(() => !!error.value);

  function addMessage(message: Pick<ChatMessage, "type" | "text">) {
    messages.value.push({
      ...message,
      timestamp: new Date(),
      id: Date.now(),
    });
  }

  // Chat actions
  async function sendMessage(message: string) {
    try {
      // Add user message
      addMessage({ type: "user", text: message });

      isTyping.value = true;
      error.value = null;

      // Get chat context from recent messages
      const context = messages.value
        .slice(-5)
        .map((m) => `${m.type}: ${m.text}`)
        .join("\n");

      // The backend only exposes /suggestions — use it to answer chat messages
      const response = await getBookSuggestionsApi(message);
      const reply =
        response?.reply ||
        response?.data?.reply ||
        response?.suggestions ||
        response?.data?.suggestions ||
        "Xin lỗi, tôi chưa có câu trả lời phù hợp.";

      // Add bot response
      addMessage({
        type: "bot",
        text: typeof reply === "string" ? reply : JSON.stringify(reply),
      });

      chatContext.value = context;
    } catch (err: any) {
      error.value = err.message || "Có lỗi xảy ra khi gửi tin nhắn";
      addMessage({
        type: "bot",
        text: "Xin lỗi, tôi gặp lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại.",
      });
    } finally {
      isTyping.value = false;
    }
  }

  // Suggestions actions
  async function getBookSuggestions(preferences: string) {
    try {
      loadingSuggestions.value = true;
      error.value = null;

      const response = await getBookSuggestionsApi(preferences);
      suggestions.value = response.data?.suggestions || [];
    } catch (err: any) {
      error.value = err.message || "Có lỗi xảy ra khi lấy gợi ý sách";
      suggestions.value = [];
    } finally {
      loadingSuggestions.value = false;
    }
  }

  // Review actions
  async function generateReview(reviewData: Record<string, unknown>) {
    try {
      loadingReview.value = true;
      error.value = null;

      const response = await generateSmartReview(reviewData);
      generatedReview.value = response.data;
    } catch (err: any) {
      error.value = err.message || "Có lỗi xảy ra khi tạo review";
      generatedReview.value = null;
    } finally {
      loadingReview.value = false;
    }
  }

  // UI actions
  function toggleChatbot() {
    isChatbotOpen.value = !isChatbotOpen.value;
  }

  function openChatbot() {
    isChatbotOpen.value = true;
  }

  function closeChatbot() {
    isChatbotOpen.value = false;
  }

  function setActiveTab(tab: string) {
    activeTab.value = tab;
  }

  function clearError() {
    error.value = null;
  }

  // Initialize chatbot
  function initializeChatbot() {
    addMessage({
      type: "bot",
      text: "Xin chào! Tôi là AI tư vấn sách. Tôi có thể giúp bạn tìm sách phù hợp, viết review hoặc trò chuyện về sách. Bạn cần hỗ trợ gì?",
    });
  }

  // Clear all data
  function resetChatbot() {
    messages.value = [];
    suggestions.value = [];
    generatedReview.value = null;
    readingAnalysis.value = null;
    error.value = null;
    isChatbotOpen.value = false;
    activeTab.value = "chat";
  }

  return {
    // state
    messages,
    isTyping,
    chatContext,
    suggestions,
    loadingSuggestions,
    generatedReview,
    loadingReview,
    readingAnalysis,
    loadingAnalysis,
    isChatbotOpen,
    activeTab,
    error,
    // getters
    recentMessages,
    hasMessages,
    hasSuggestions,
    hasGeneratedReview,
    hasAnalysis,
    isLoading,
    hasError,
    // actions
    addMessage,
    sendMessage,
    getBookSuggestions,
    generateReview,
    toggleChatbot,
    openChatbot,
    closeChatbot,
    setActiveTab,
    clearError,
    initializeChatbot,
    resetChatbot,
  };
});
