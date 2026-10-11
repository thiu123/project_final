<template>
  <div class="chatbot-container">
    <button
      v-if="!isChatbotOpen"
      type="button"
      class="inline-flex h-11 items-center gap-2.5 bg-foreground px-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-background shadow-[0_18px_40px_-20px_hsl(var(--foreground)/0.6)] transition-colors hover:bg-foreground/85"
      @click="toggleChatbot"
    >
      <Sparkles class="size-4" :stroke-width="1.5" />
      AI Advisor
    </button>

    <div
      v-else
      class="chatbot-window flex flex-col overflow-hidden border border-border bg-background shadow-[0_32px_64px_-32px_hsl(var(--foreground)/0.45)]"
    >
      <div class="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4">
        <div class="grow">
          <p class="eyebrow">AI Book Advisor</p>
          <p class="mt-2 font-serif text-xl leading-tight">
            Ask the <span class="italic">bookseller</span>
          </p>
          <p class="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span class="size-1.5 rounded-full bg-success"></span>
            Online
          </p>
        </div>
        <button
          type="button"
          class="inline-flex size-8 items-center justify-center transition-opacity hover:opacity-60 disabled:opacity-30"
          aria-label="Cuộc trò chuyện mới"
          title="Cuộc trò chuyện mới"
          :disabled="isTyping"
          @click="resetConversation"
        >
          <RotateCcw class="size-4" :stroke-width="1.5" />
        </button>
        <button
          type="button"
          class="inline-flex size-8 items-center justify-center transition-opacity hover:opacity-60"
          aria-label="Đóng"
          @click="toggleChatbot"
        >
          <X class="size-5" :stroke-width="1.5" />
        </button>
      </div>

      <div class="flex min-h-0 flex-1 flex-col">
        <div ref="messagesContainer" class="messages-container flex-1 overflow-y-auto p-5">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message mb-4 flex"
            :class="message.type === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div class="message-card max-w-[85%] px-4 py-3" :class="bubbleClass(message)">
              <div class="whitespace-pre-wrap text-sm leading-relaxed">
                {{ message.text }}
              </div>

              <div v-if="message.books?.length" class="mt-3 space-y-2">
                <button
                  v-for="book in message.books"
                  :key="book.bookId"
                  type="button"
                  class="book-suggestion group block w-full border border-border bg-background p-3 text-left transition-colors hover:border-foreground"
                  @click="goToBookDetail(book.bookId)"
                >
                  <span class="block font-serif text-base leading-snug text-foreground group-hover:text-primary">
                    {{ book.title }}
                  </span>
                  <span class="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    <span class="tabular-nums text-foreground">{{ formatPrice(book.price) }}</span>
                    <span v-if="book.rating" class="inline-flex items-center gap-1">
                      <Star class="size-3 fill-current" />
                      {{ book.rating }}
                    </span>
                    <span v-if="!book.inStock" class="text-destructive">Hết hàng</span>
                  </span>
                  <span v-if="book.subjects.length" class="mt-1 block text-xs capitalize text-muted-foreground">
                    {{ book.subjects.join(", ") }}
                  </span>
                  <span class="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
                    Xem chi tiết
                    <ArrowRight class="size-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              </div>

              <div class="mt-1.5 text-[10px] tabular-nums" :class="timeClass(message)">
                {{ formatTime(message.timestamp) }}
              </div>
            </div>
          </div>

          <div v-if="isTyping" class="message mb-4 flex justify-start">
            <div class="flex items-center gap-2 bg-muted px-4 py-3 text-xs text-muted-foreground">
              <UiSpinner size="sm" />
              Đang tìm...
            </div>
          </div>
        </div>

        <div class="shrink-0 border-t border-border px-5 pb-2 pt-4">
          <p class="eyebrow mb-3">Gợi ý nhanh</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="prompt in QUICK_PROMPTS"
              :key="prompt"
              type="button"
              class="border border-border px-3 py-1.5 text-xs transition-colors hover:border-foreground disabled:opacity-40"
              :disabled="isTyping"
              @click="send(prompt)"
            >
              {{ prompt }}
            </button>
          </div>
        </div>

        <div class="shrink-0 px-5 pb-5 pt-3">
          <div class="flex items-end gap-2 border-b border-input focus-within:border-foreground">
            <textarea
              v-model="newMessage"
              rows="2"
              placeholder="Ví dụ: 'manga dưới 15 còn hàng' hoặc 'đánh giá Naruto'"
              :disabled="isTyping"
              class="min-w-0 flex-1 resize-none bg-transparent py-2 text-sm placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-50"
              @keydown.enter.exact.prevent="submit"
            ></textarea>
            <button
              type="button"
              class="mb-2 inline-flex size-8 shrink-0 items-center justify-center transition-opacity hover:opacity-60 disabled:opacity-30"
              :disabled="!newMessage.trim() || isTyping"
              aria-label="Gửi"
              @click="submit"
            >
              <Send class="size-4" :stroke-width="1.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useChatbotStore } from "@/stores/chatbot";
import { ArrowRight, RotateCcw, Send, Sparkles, Star, X } from "lucide-vue-next";
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
    return "ml-auto bg-foreground text-background";
  }
  return message.failed
    ? "mr-auto border border-destructive/40 text-foreground"
    : "mr-auto bg-muted text-foreground";
}

function timeClass(message: ChatMessage): string {
  return message.type === "user" ? "text-background/60" : "text-muted-foreground";
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

.chatbot-window {
  width: 380px;
  height: 600px;
}

.message-card {
  word-wrap: break-word;
}

.book-suggestion {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
}

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
}

.message {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
