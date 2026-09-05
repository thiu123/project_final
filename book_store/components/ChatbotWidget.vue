<template>
  <div class="chatbot-container">
    <!-- Chatbot toggle button -->
    <UiButton
      v-if="!isChatbotOpen"
      size="lg"
      class="chatbot-toggle rounded-full shadow-md"
      @click="toggleChatbot"
    >
      <Bot class="mr-1 h-5 w-5" />
      AI Advisor
    </UiButton>

    <!-- Chatbot interface -->
    <div
      v-else
      class="chatbot-window flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
    >
      <!-- Header -->
      <div class="chatbot-header shrink-0 p-4">
        <div class="flex w-full items-center">
          <div
            class="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
          >
            <Bot class="h-6 w-6 text-primary" />
          </div>
          <div class="grow">
            <div class="text-lg font-semibold leading-tight">
              AI Book Advisor
            </div>
            <div class="text-xs opacity-90">Online</div>
          </div>
          <button
            type="button"
            class="rounded-full p-1.5 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
            @click="toggleChatbot"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Chat Interface -->
      <div class="flex min-h-0 flex-1 flex-col">
        <!-- Messages Area -->
        <div
          ref="messagesContainer"
          class="messages-container flex-1 overflow-y-auto bg-muted/40 p-4"
        >
          <div
            v-for="(message, index) in widgetMessages"
            :key="index"
            class="message mb-3 flex"
            :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="message-card max-w-[80%] rounded-lg p-3"
              :class="
                message.type === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'mr-auto bg-muted text-foreground'
              "
            >
              <!-- Regular text message -->
              <div
                v-if="!message.suggestions && !message.review"
                class="whitespace-pre-wrap text-sm leading-relaxed"
              >
                {{ message.text }}
              </div>

              <!-- Book Suggestions Display -->
              <div v-if="message.suggestions">
                <div class="mb-3 text-sm">
                  {{ message.text }}
                </div>
                <div
                  v-for="(book, idx) in message.suggestions"
                  :key="idx"
                  class="book-suggestion mb-2"
                >
                  <div
                    class="book-card-clickable rounded-lg border border-primary/30 bg-primary/5 p-2"
                    @click="goToBookDetail(book.bookId)"
                  >
                    <div class="text-sm font-bold text-foreground">
                      📚 {{ book.title }}
                    </div>
                    <div class="mb-1 text-xs text-muted-foreground">
                      <strong>Subjects:</strong>
                      {{
                        Array.isArray(book.subjects)
                          ? book.subjects.join(", ")
                          : book.subjects
                      }}
                    </div>
                    <div class="mb-2 text-sm text-foreground">
                      {{ book.reason }}
                    </div>
                    <UiButton
                      size="xs"
                      variant="ghost"
                      class="text-primary"
                      @click.stop="goToBookDetail(book.bookId)"
                    >
                      <ArrowRight class="mr-1 h-3.5 w-3.5" />
                      View Details
                    </UiButton>
                  </div>
                </div>
              </div>

              <!-- Book Review Display -->
              <div v-if="message.review">
                <div class="mb-3 text-sm">
                  {{ message.text }}
                </div>
                <div
                  class="book-card-clickable rounded-lg border border-success/30 bg-success/5 p-3"
                  @click="goToBookDetail(message.review.bookInfo.id)"
                >
                  <div class="mb-2 text-sm font-bold text-success">
                    ⭐ {{ message.review.bookInfo.title }}
                  </div>
                  <div class="mb-2 text-xs text-muted-foreground">
                    <strong>Subjects:</strong>
                    {{ message.review.bookInfo.subjects.join(", ") }}
                  </div>
                  <div class="mb-2 text-sm leading-relaxed text-foreground">
                    {{ message.review.generatedReview }}
                  </div>
                  <UiButton
                    size="sm"
                    variant="ghost"
                    class="text-primary"
                    @click.stop="goToBookDetail(message.review.bookInfo.id)"
                  >
                    <ArrowRight class="mr-1 h-4 w-4" />
                    View Details
                  </UiButton>
                </div>
              </div>

              <div
                class="mt-1 text-xs"
                :class="
                  message.type === 'user'
                    ? 'text-primary-foreground/80'
                    : 'text-muted-foreground'
                "
              >
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="message mb-3 flex justify-start">
            <div class="mr-auto max-w-[80%] rounded-lg bg-muted p-3">
              <div class="flex items-center">
                <UiSpinner size="sm" class="text-primary" />
                <span class="ml-2 text-xs">Thinking...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="shrink-0 bg-card">
          <UiSeparator class="mb-3" />
          <div class="px-4 pb-2">
            <div class="mb-2 text-xs text-muted-foreground">
              Quick suggestions:
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="quick-action-chip inline-flex items-center gap-1 rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary"
                @click="sendQuickMessage('suggest best book for me')"
              >
                <Star class="h-3.5 w-3.5" />
                Best books
              </button>
              <button
                type="button"
                class="quick-action-chip inline-flex items-center gap-1 rounded-full border border-success px-3 py-1 text-xs font-medium text-success"
                @click="sendQuickMessage('review Naruto')"
              >
                <Star class="h-3.5 w-3.5 fill-current" />
                Book reviews
              </button>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="shrink-0 bg-card p-4 pt-2">
          <div class="relative">
            <UiTextarea
              v-model="newMessage"
              :rows="2"
              placeholder="E.g: 'fantasy books' or 'review Harry Potter'"
              :disabled="isTyping"
              class="resize-none pr-12"
              @keypress.enter.exact="sendMessage"
            />
            <UiButton
              size="iconSm"
              variant="ghost"
              class="absolute bottom-2 right-2 text-primary"
              :disabled="!newMessage.trim() || isTyping"
              aria-label="Send"
              @click="sendMessage"
            >
              <Send class="h-4 w-4" />
            </UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useChatbotStore } from "@/stores/chatbot";
import { ArrowRight, Bot, Send, Star, X } from "lucide-vue-next";
import { getBookSuggestions, generateSmartReview } from "@/api/chatbotApi";
import type { ChatMessage } from "@/types";

interface SuggestedBook {
  bookId: string;
  title: string;
  subjects: string[] | string;
  reason: string;
}

interface GeneratedReviewData {
  bookInfo: { id: string; title: string; subjects: string[] };
  generatedReview: string;
}

type WidgetMessage = ChatMessage & {
  suggestions?: SuggestedBook[];
  review?: GeneratedReviewData;
};

const router = useRouter();
const chatbotStore = useChatbotStore();
const { messages, isTyping, isChatbotOpen } = storeToRefs(chatbotStore);

const widgetMessages = computed(() => messages.value as WidgetMessage[]);

const newMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!messages.value.length) {
    pushMessage({
      type: "bot",
      text: "Hello! I'm your AI Book Advisor. I can help you with:\n\n📚 Book recommendations\n⭐ Book reviews\n🎯 Best books in store\n\nExamples:\n• 'suggest best book for me'\n• 'I want fantasy books with magic'\n• 'help me find a good book'\n• 'review Harry Potter'\n\nJust chat naturally! 😊",
    });
  }
});

function pushMessage(
  message: Pick<WidgetMessage, "type" | "text" | "suggestions" | "review">
) {
  messages.value.push({
    ...message,
    timestamp: new Date(),
    id: Date.now(),
  } as WidgetMessage);
}

function toggleChatbot() {
  chatbotStore.toggleChatbot();
  if (isChatbotOpen.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
}

function sendQuickMessage(message: string) {
  newMessage.value = message;
  sendMessage();
}

async function sendMessage() {
  if (!newMessage.value.trim()) return;

  const messageText = newMessage.value.trim();
  pushMessage({ type: "user", text: newMessage.value });
  newMessage.value = "";
  isTyping.value = true;

  // Scroll to bottom after adding user message
  scrollToBottom();

  try {
    // Simple check: if message contains "review" → review, else → suggestion
    if (messageText.toLowerCase().includes("review")) {
      await handleReviewRequest(messageText);
    } else {
      await handleBookSuggestions(messageText);
    }
  } catch (error: any) {
    console.error("Chat error:", error);
    pushMessage({
      type: "bot",
      text: "Sorry, I encountered an error processing your message. Please try again later.",
    });
  } finally {
    isTyping.value = false;
    scrollToBottom();
  }
}

async function handleBookSuggestions(userPreferences: string) {
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
        pushMessage({
          type: "bot",
          text: "I couldn't find any books matching your preferences. Please try different keywords or broader categories.",
        });
      } else {
        pushMessage({
          type: "bot",
          text: "Here are my book recommendations for you:",
          suggestions: response.data.suggestions,
        });
      }
    } else {
      pushMessage({
        type: "bot",
        text: "I couldn't find any books matching your preferences. Please try different keywords.",
      });
    }
  } catch (error: any) {
    console.error("Book suggestions error:", error);
    pushMessage({
      type: "bot",
      text: "Sorry, I couldn't process your book recommendation request. Please try again.",
    });
  }
}

async function handleReviewRequest(messageText: string) {
  try {
    // No need to extract "review" prefix anymore,
    // just pass the entire message to backend
    const response = await generateSmartReview({ bookQuery: messageText });

    if (response.success && response.data.bookFound) {
      pushMessage({
        type: "bot",
        text: "Here's my review for the book:",
        review: response.data,
      });
    } else {
      pushMessage({
        type: "bot",
        text:
          response.message || `Sorry, I couldn't find that book in our store.`,
      });
    }
  } catch (error: any) {
    console.error("Review generation error:", error);
    const errorMessage =
      error.message ||
      "Sorry, I couldn't generate a review for that book. Please try again.";
    pushMessage({
      type: "bot",
      text: errorMessage,
    });
  }
}

function formatTime(timestamp: Date | string) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function scrollToBottom() {
  nextTick(() => {
    const container = messagesContainer.value;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
}

function goToBookDetail(bookId: string) {
  if (bookId) {
    // Navigate to book detail page
    router.push(`/details/${bookId}`);
    // Optionally close the chatbot
    chatbotStore.closeChatbot();
  }
}
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
    box-shadow: 0 0 0 0 rgba(82, 149, 208, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(82, 149, 208, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(82, 149, 208, 0);
  }
}

.chatbot-window {
  width: 380px;
  height: 600px;
}

.chatbot-header {
  background: linear-gradient(135deg, #5295d0 0%, #3d7cb4 100%);
  color: #fff;
}

.message-card {
  max-width: 280px;
  word-wrap: break-word;
}

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
  background: transparent;
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
