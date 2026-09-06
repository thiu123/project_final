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
            aria-label="Cuộc trò chuyện mới"
            title="Cuộc trò chuyện mới"
            :disabled="isTyping"
            @click="resetConversation"
          >
            <RotateCcw class="h-4 w-4" />
          </button>
          <button
            type="button"
            class="rounded-full p-1.5 text-white transition-colors hover:bg-white/20"
            aria-label="Đóng"
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
            v-for="message in messages"
            :key="message.id"
            class="message mb-3 flex"
            :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="message-card max-w-[80%] rounded-lg p-3"
              :class="bubbleClass(message)"
            >
              <div class="whitespace-pre-wrap text-sm leading-relaxed">
                {{ message.text }}
              </div>

              <!-- Books the advisor named, resolved to real catalogue rows -->
              <div v-if="message.books?.length" class="mt-3">
                <div
                  v-for="book in message.books"
                  :key="book.bookId"
                  class="book-suggestion mb-2"
                >
                  <div
                    class="book-card-clickable rounded-lg border border-primary/30 bg-primary/5 p-2"
                    @click="goToBookDetail(book.bookId)"
                  >
                    <div class="text-sm font-bold text-foreground">
                      📚 {{ book.title }}
                    </div>
                    <div
                      class="mb-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground"
                    >
                      <span class="font-semibold text-primary">
                        {{ formatPrice(book.price) }}
                      </span>
                      <span v-if="book.rating">⭐ {{ book.rating }}</span>
                      <span v-if="!book.inStock" class="text-destructive">
                        Hết hàng
                      </span>
                    </div>
                    <div
                      v-if="book.subjects.length"
                      class="mb-2 text-xs text-muted-foreground"
                    >
                      {{ book.subjects.join(", ") }}
                    </div>
                    <UiButton
                      size="xs"
                      variant="ghost"
                      class="text-primary"
                      @click.stop="goToBookDetail(book.bookId)"
                    >
                      <ArrowRight class="mr-1 h-3.5 w-3.5" />
                      Xem chi tiết
                    </UiButton>
                  </div>
                </div>
              </div>

              <div class="mt-1 text-xs" :class="timeClass(message)">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="message mb-3 flex justify-start">
            <div class="mr-auto max-w-[80%] rounded-lg bg-muted p-3">
              <div class="flex items-center">
                <UiSpinner size="sm" class="text-primary" />
                <span class="ml-2 text-xs">Đang tìm...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="shrink-0 bg-card">
          <UiSeparator class="mb-3" />
          <div class="px-4 pb-2">
            <div class="mb-2 text-xs text-muted-foreground">Gợi ý nhanh:</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="prompt in QUICK_PROMPTS"
                :key="prompt"
                type="button"
                class="quick-action-chip inline-flex items-center gap-1 rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary"
                :disabled="isTyping"
                @click="send(prompt)"
              >
                <Star class="h-3.5 w-3.5" />
                {{ prompt }}
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
              placeholder="Ví dụ: 'manga dưới 15 còn hàng' hoặc 'đánh giá Naruto'"
              :disabled="isTyping"
              class="resize-none pr-12"
              @keydown.enter.exact.prevent="submit"
            />
            <UiButton
              size="iconSm"
              variant="ghost"
              class="absolute bottom-2 right-2 text-primary"
              :disabled="!newMessage.trim() || isTyping"
              aria-label="Gửi"
              @click="submit"
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
import { ArrowRight, Bot, RotateCcw, Send, Star, X } from "lucide-vue-next";
import type { ChatMessage } from "@/types";

/**
 * Prompts that show off what the advisor can now do: filter by price and
 * stock, and follow up on what it just listed.
 */
const QUICK_PROMPTS = [
  "Sách hay nhất cửa hàng",
  "Manga dưới 15 còn hàng",
  "Đánh giá Naruto",
];

const router = useRouter();
const chatbotStore = useChatbotStore();
const { messages, isTyping, isChatbotOpen } = storeToRefs(chatbotStore);
const { send: sendToAdvisor, resetConversation } = chatbotStore;

const newMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  chatbotStore.initializeChatbot();
});

// One watcher covers every path that appends a message — sending, replying,
// resetting and the typing indicator — so no call site has to remember to scroll.
watch(
  [messages, isTyping, isChatbotOpen],
  () => {
    if (!isChatbotOpen.value) return;
    nextTick(() => {
      const container = messagesContainer.value;
      if (container) container.scrollTop = container.scrollHeight;
    });
  },
  { deep: true }
);

function toggleChatbot() {
  chatbotStore.toggleChatbot();
}

/** Intent routing now lives in the model, not in a substring check. */
async function send(message: string) {
  await sendToAdvisor(message);
}

async function submit() {
  const text = newMessage.value;
  newMessage.value = "";
  await send(text);
}

function bubbleClass(message: ChatMessage): string {
  if (message.type === "user") {
    return "ml-auto bg-primary text-primary-foreground";
  }
  return message.failed
    ? "mr-auto border border-destructive/40 bg-destructive/10 text-foreground"
    : "mr-auto bg-muted text-foreground";
}

function timeClass(message: ChatMessage): string {
  return message.type === "user"
    ? "text-primary-foreground/80"
    : "text-muted-foreground";
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN").format(price);
}

function formatTime(timestamp: Date | string) {
  return new Date(timestamp).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function goToBookDetail(bookId: string) {
  if (!bookId) return;
  router.push(`/details/${bookId}`);
  chatbotStore.closeChatbot();
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
