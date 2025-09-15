import {
  chatWithBot,
  getBookSuggestions,
  generateSmartReview,
} from "@/api/chatbotApi";

export default {
  namespaced: true,
  state: () => ({
    // Chat state
    messages: [],
    isTyping: false,
    chatContext: "",

    // Suggestions state
    suggestions: [],
    loadingSuggestions: false,

    // Review state
    generatedReview: null,
    loadingReview: false,

    // Analysis state
    readingAnalysis: null,
    loadingAnalysis: false,

    // UI state
    isChatbotOpen: false,
    activeTab: "chat",

    // Error handling
    error: null,
  }),

  mutations: {
    // Chat mutations
    addMessage(state, message) {
      state.messages.push({
        ...message,
        timestamp: new Date(),
        id: Date.now(),
      });
    },

    setTyping(state, isTyping) {
      state.isTyping = isTyping;
    },

    setChatContext(state, context) {
      state.chatContext = context;
    },

    clearMessages(state) {
      state.messages = [];
    },

    // Suggestions mutations
    setSuggestions(state, suggestions) {
      state.suggestions = suggestions;
    },

    setLoadingSuggestions(state, loading) {
      state.loadingSuggestions = loading;
    },

    // Review mutations
    setGeneratedReview(state, review) {
      state.generatedReview = review;
    },

    setLoadingReview(state, loading) {
      state.loadingReview = loading;
    },

    // Analysis mutations
    setReadingAnalysis(state, analysis) {
      state.readingAnalysis = analysis;
    },

    setLoadingAnalysis(state, loading) {
      state.loadingAnalysis = loading;
    },

    // UI mutations
    setChatbotOpen(state, isOpen) {
      state.isChatbotOpen = isOpen;
    },

    setActiveTab(state, tab) {
      state.activeTab = tab;
    },

    // Error handling
    setError(state, error) {
      state.error = error;
    },

    clearError(state) {
      state.error = null;
    },
  },

  actions: {
    // Chat actions
    async sendMessage({ commit, state }, message) {
      try {
        // Add user message
        commit("addMessage", {
          type: "user",
          text: message,
        });

        commit("setTyping", true);
        commit("clearError");

        // Get chat context from recent messages
        const context = state.messages
          .slice(-5)
          .map((m) => `${m.type}: ${m.text}`)
          .join("\n");

        // Send to AI
        const response = await chatWithBot(message, context);

        // Add bot response
        commit("addMessage", {
          type: "bot",
          text: response.data.reply,
        });

        commit("setChatContext", context);
      } catch (error) {
        commit("setError", error.message || "Có lỗi xảy ra khi gửi tin nhắn");
        commit("addMessage", {
          type: "bot",
          text: "Xin lỗi, tôi gặp lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại.",
        });
      } finally {
        commit("setTyping", false);
      }
    },

    // Suggestions actions
    async getBookSuggestions({ commit }, preferences) {
      try {
        commit("setLoadingSuggestions", true);
        commit("clearError");

        const response = await getBookSuggestions(preferences);
        commit("setSuggestions", response.data.suggestions || []);
      } catch (error) {
        commit("setError", error.message || "Có lỗi xảy ra khi lấy gợi ý sách");
        commit("setSuggestions", []);
      } finally {
        commit("setLoadingSuggestions", false);
      }
    },

    // Review actions
    async generateReview({ commit, rootState }, reviewData) {
      try {
        commit("setLoadingReview", true);
        commit("clearError");

        const token = rootState.auth.accessToken;
        const response = await generateSmartReview(reviewData, token);

        commit("setGeneratedReview", response.data);
      } catch (error) {
        commit("setError", error.message || "Có lỗi xảy ra khi tạo review");
        commit("setGeneratedReview", null);
      } finally {
        commit("setLoadingReview", false);
      }
    },

    // Analysis actions
    async analyzeReadingTrends({ commit, rootState }, userId) {
      try {
        commit("setLoadingAnalysis", true);
        commit("clearError");

        const token = rootState.auth.accessToken;
        const response = await analyzeReadingTrends(userId, token);

        commit("setReadingAnalysis", response.data);
      } catch (error) {
        commit(
          "setError",
          error.message || "Có lỗi xảy ra khi phân tích xu hướng đọc"
        );
        commit("setReadingAnalysis", null);
      } finally {
        commit("setLoadingAnalysis", false);
      }
    },

    // UI actions
    toggleChatbot({ commit, state }) {
      commit("setChatbotOpen", !state.isChatbotOpen);
    },

    openChatbot({ commit }) {
      commit("setChatbotOpen", true);
    },

    closeChatbot({ commit }) {
      commit("setChatbotOpen", false);
    },

    setActiveTab({ commit }, tab) {
      commit("setActiveTab", tab);
    },

    // Initialize chatbot
    initializeChatbot({ commit }) {
      commit("addMessage", {
        type: "bot",
        text: "Xin chào! Tôi là AI tư vấn sách. Tôi có thể giúp bạn tìm sách phù hợp, viết review hoặc trò chuyện về sách. Bạn cần hỗ trợ gì?",
      });
    },

    // Clear all data
    resetChatbot({ commit }) {
      commit("clearMessages");
      commit("setSuggestions", []);
      commit("setGeneratedReview", null);
      commit("setReadingAnalysis", null);
      commit("clearError");
      commit("setChatbotOpen", false);
      commit("setActiveTab", "chat");
    },
  },

  getters: {
    // Chat getters
    recentMessages: (state) => state.messages.slice(-10),
    hasMessages: (state) => state.messages.length > 0,

    // Suggestions getters
    hasSuggestions: (state) => state.suggestions.length > 0,

    // Review getters
    hasGeneratedReview: (state) => !!state.generatedReview,

    // Analysis getters
    hasAnalysis: (state) => !!state.readingAnalysis,

    // UI getters
    isLoading: (state) =>
      state.isTyping ||
      state.loadingSuggestions ||
      state.loadingReview ||
      state.loadingAnalysis,

    // Error getters
    hasError: (state) => !!state.error,
  },
};
