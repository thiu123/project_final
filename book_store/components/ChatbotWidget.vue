<template>
  <div class="chatbot-container">
    <!-- Chatbot toggle button -->
    <v-btn
      v-if="!isOpen"
      @click="toggleChatbot"
      color="primary"
      size="large"
      class="chatbot-toggle"
      elevation="4"
      rounded="pill"
    >
      <v-icon start>mdi-robot</v-icon>
      AI Advisor
    </v-btn>

    <!-- Chatbot interface -->
    <v-card v-if="isOpen" class="chatbot-window" elevation="8" rounded="xl">
      <!-- Header -->
      <v-card-title class="chatbot-header pa-4">
        <div class="d-flex align-center w-100">
          <v-avatar color="white" size="40" class="me-3">
            <v-icon color="primary" size="24">mdi-robot</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6 mb-0">AI Book Advisor</div>
            <div class="text-caption opacity-90">Online</div>
          </div>
          <v-btn
            @click="toggleChatbot"
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
          ></v-btn>
        </div>
      </v-card-title>

      <!-- Chat Interface -->
      <div class="chatbot-content">
        <!-- Messages Area -->
        <div ref="messagesContainer" class="messages-container">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message mb-3"
            :class="message.type"
          >
            <v-card
              :color="message.type === 'user' ? 'primary' : 'grey-lighten-4'"
              :class="[
                message.type === 'user' ? 'ml-auto' : 'mr-auto',
                'message-card',
              ]"
              variant="flat"
              rounded="lg"
              max-width="80%"
            >
              <v-card-text class="pa-3">
                <!-- Regular text message -->
                <div
                  v-if="!message.suggestions && !message.review"
                  :style="{
                    'white-space': 'pre-wrap',
                    'line-height': '1.5',
                    color: message.type === 'user' ? '#ffffff' : '#000000',
                  }"
                >
                  {{ message.text }}
                </div>

                <!-- Book Suggestions Display -->
                <div
                  v-if="message.suggestions"
                  class="text-white"
                  style="color: #000000 !important"
                >
                  <div
                    class="text-body-2 mb-3"
                    style="color: #000000 !important"
                  >
                    {{ message.text }}
                  </div>
                  <div
                    v-for="(book, idx) in message.suggestions"
                    :key="idx"
                    class="book-suggestion mb-2"
                  >
                    <v-card
                      color="blue-lighten-5"
                      variant="outlined"
                      class="pa-2 book-card-clickable"
                      @click="goToBookDetail(book.bookId)"
                    >
                      <div
                        class="text-subtitle-2 font-weight-bold text-primary"
                        style="color: #000000 !important"
                      >
                        📚 {{ book.title }}
                      </div>
                      <div
                        class="text-caption text-grey-darken-1 mb-1"
                        style="color: #000000 !important"
                      >
                        <strong>Subjects:</strong>
                        {{
                          Array.isArray(book.subjects)
                            ? book.subjects.join(", ")
                            : book.subjects
                        }}
                      </div>
                      <div
                        class="text-body-2 mb-2"
                        style="color: #000000 !important"
                      >
                        {{ book.reason }}
                      </div>
                      <v-btn
                        size="x-small"
                        color="primary"
                        variant="text"
                        prepend-icon="mdi-arrow-right"
                        @click.stop="goToBookDetail(book.bookId)"
                      >
                        View Details
                      </v-btn>
                    </v-card>
                  </div>
                </div>

                <!-- Book Review Display -->
                <div
                  v-if="message.review"
                  class="text-black"
                  style="color: #000000 !important"
                >
                  <div
                    class="text-body-2 mb-3"
                    style="color: #000000 !important"
                  >
                    {{ message.text }}
                  </div>
                  <v-card
                    color="green-lighten-5"
                    variant="outlined"
                    class="pa-3 book-card-clickable"
                    @click="goToBookDetail(message.review.bookInfo.id)"
                  >
                    <div
                      class="text-subtitle-2 font-weight-bold text-success mb-2"
                      style="color: #000000 !important"
                    >
                      ⭐ {{ message.review.bookInfo.title }}
                    </div>
                    <div
                      class="text-caption text-grey-darken-1 mb-2"
                      style="color: #000000 !important"
                    >
                      <strong>Subjects:</strong>
                      {{ message.review.bookInfo.subjects.join(", ") }}
                    </div>
                    <div
                      class="text-body-2 mb-2"
                      style="line-height: 1.6; color: #000000 !important"
                    >
                      {{ message.review.generatedReview }}
                    </div>
                    <v-btn
                      size="small"
                      color="primary"
                      variant="text"
                      prepend-icon="mdi-arrow-right"
                      @click.stop="goToBookDetail(message.review.bookInfo.id)"
                    >
                      View Details
                    </v-btn>
                  </v-card>
                </div>

                <div
                  :class="
                    message.type === 'user'
                      ? 'text-white'
                      : 'text-grey-darken-1'
                  "
                  class="text-caption mt-1"
                >
                  {{ formatTime(message.timestamp) }}
                </div>
              </v-card-text>
            </v-card>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="message bot mb-3">
            <v-card
              color="grey-lighten-4"
              variant="flat"
              rounded="lg"
              max-width="80%"
              class="mr-auto"
            >
              <v-card-text class="pa-3">
                <div class="typing-indicator">
                  <v-progress-circular
                    indeterminate
                    size="16"
                    width="2"
                    color="primary"
                  ></v-progress-circular>
                  <span class="text-caption ml-2">Thinking...</span>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions-section">
          <v-divider class="mb-3"></v-divider>
          <div class="px-4 pb-2">
            <div class="text-caption text-grey-darken-1 mb-2">
              Quick suggestions:
            </div>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                @click="sendQuickMessage('suggest best book for me')"
                color="primary"
                variant="outlined"
                size="small"
                prepend-icon="mdi-star-outline"
                clickable
                class="quick-action-chip"
              >
                Best books
              </v-chip>
              <v-chip
                @click="sendQuickMessage('review Naruto')"
                color="success"
                variant="outlined"
                size="small"
                prepend-icon="mdi-star"
                clickable
                class="quick-action-chip"
              >
                Book reviews
              </v-chip>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-section">
          <v-card-actions class="pa-4 pt-2">
            <v-text-field
              v-model="newMessage"
              placeholder="E.g: 'fantasy books' or 'review Harry Potter'"
              variant="outlined"
              density="compact"
              hide-details
              @keypress.enter="sendMessage"
              :disabled="isTyping"
              class="flex-grow-1"
            >
              <template #append-inner>
                <v-btn
                  @click="sendMessage"
                  :disabled="!newMessage.trim() || isTyping"
                  icon="mdi-send"
                  variant="text"
                  color="primary"
                  size="small"
                ></v-btn>
              </template>
            </v-text-field>
          </v-card-actions>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { getBookSuggestions, generateSmartReview } from "@/api/chatbotApi";

export default {
  name: "ChatbotWidget",
  data() {
    return {
      isOpen: false,
      messages: [
        {
          type: "bot",
          text: "Hello! I'm your AI Book Advisor. I can help you with:\n\n📚 Book recommendations\n⭐ Book reviews\n🎯 Best books in store\n\nExamples:\n• 'suggest best book for me'\n• 'I want fantasy books with magic'\n• 'help me find a good book'\n• 'review Harry Potter'\n\nJust chat naturally! 😊",
          timestamp: new Date(),
        },
      ],
      newMessage: "",
      isTyping: false,
    };
  },
  computed: {
    ...mapState("auth", ["currentUser", "accessToken"]),
  },
  methods: {
    toggleChatbot() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    sendQuickMessage(message) {
      this.newMessage = message;
      this.sendMessage();
    },

    async sendMessage() {
      if (!this.newMessage.trim()) return;

      const userMessage = {
        type: "user",
        text: this.newMessage,
        timestamp: new Date(),
      };

      this.messages.push(userMessage);
      const messageText = this.newMessage.trim();
      this.newMessage = "";
      this.isTyping = true;

      // Scroll to bottom after adding user message
      this.scrollToBottom();

      try {
        // Simple check: if message contains "review" → review, else → suggestion
        if (messageText.toLowerCase().includes("review")) {
          await this.handleReviewRequest(messageText);
        } else {
          await this.handleBookSuggestions(messageText);
        }
      } catch (error) {
        console.error("Chat error:", error);
        this.messages.push({
          type: "bot",
          text: "Sorry, I encountered an error processing your message. Please try again later.",
          timestamp: new Date(),
        });
      } finally {
        this.isTyping = false;
        this.scrollToBottom();
      }
    },

    async handleBookSuggestions(userPreferences) {
      try {
        const response = await getBookSuggestions(userPreferences);

        if (
          response.success &&
          response.data.suggestions &&
          response.data.suggestions.length > 0
        ) {
          // Check if no books found
          if (
            response.data.suggestions.length === 1 &&
            response.data.suggestions[0].title === "No books available"
          ) {
            this.messages.push({
              type: "bot",
              text: "I couldn't find any books matching your preferences. Please try different keywords or broader categories.",
              timestamp: new Date(),
            });
          } else {
            this.messages.push({
              type: "bot",
              text: "Here are my book recommendations for you:",
              suggestions: response.data.suggestions,
              timestamp: new Date(),
            });
          }
        } else {
          this.messages.push({
            type: "bot",
            text: "I couldn't find any books matching your preferences. Please try different keywords.",
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Book suggestions error:", error);
        this.messages.push({
          type: "bot",
          text: "Sorry, I couldn't process your book recommendation request. Please try again.",
          timestamp: new Date(),
        });
      }
    },

    async handleReviewRequest(messageText) {
      try {
        // No need to extract "review" prefix anymore,
        // just pass the entire message to backend
        const response = await generateSmartReview({ bookQuery: messageText });

        if (response.success && response.data.bookFound) {
          this.messages.push({
            type: "bot",
            text: "Here's my review for the book:",
            review: response.data,
            timestamp: new Date(),
          });
        } else {
          this.messages.push({
            type: "bot",
            text:
              response.message ||
              `Sorry, I couldn't find that book in our store.`,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Review generation error:", error);
        const errorMessage =
          error.message ||
          "Sorry, I couldn't generate a review for that book. Please try again.";
        this.messages.push({
          type: "bot",
          text: errorMessage,
          timestamp: new Date(),
        });
      }
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    goToBookDetail(bookId) {
      if (bookId) {
        // Navigate to book detail page
        this.$router.push(`/details/${bookId}`);
        // Optionally close the chatbot
        this.isOpen = false;
      }
    },
  },

  // Auto scroll when messages change
  watch: {
    messages: {
      handler() {
        this.scrollToBottom();
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chatbot-toggle {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
  }
}

.chatbot-window {
  width: 380px;
  height: 600px;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.chatbot-header {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
  color: white !important;
  flex-shrink: 0;
}

.chatbot-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0; /* Important for flex scrolling */
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #fafafa;
}

.quick-actions-section {
  flex-shrink: 0;
  background-color: white;
}

.input-section {
  flex-shrink: 0;
  background-color: white;
}

.message-card {
  max-width: 280px;
  word-wrap: break-word;
}

.message.user {
  display: flex;
  justify-content: flex-end;
}

.message.bot {
  display: flex;
  justify-content: flex-start;
}

.typing-indicator {
  display: flex;
  align-items: center;
}

.quick-action-chip {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.quick-action-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Book suggestion styles */
.book-suggestion {
  animation: fadeIn 0.5s ease-in;
}

/* Clickable book cards */
.book-card-clickable {
  cursor: pointer;
  transition: all 0.3s ease;
}

.book-card-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .chatbot-window {
    width: calc(100vw - 40px);
    height: 500px;
  }

  .chatbot-container {
    right: 10px;
    bottom: 10px;
  }
}

@media (max-width: 480px) {
  .chatbot-window {
    width: calc(100vw - 20px);
    height: 450px;
  }

  .chatbot-container {
    right: 5px;
    bottom: 5px;
  }

  .message-card {
    max-width: 250px;
  }
}

/* Animation for messages */
.message {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
