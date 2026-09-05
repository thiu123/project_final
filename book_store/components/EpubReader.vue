<template>
  <div class="relative h-screen bg-gradient-to-b from-muted/60 to-muted">
    <!-- Loading overlay -->
    <div
      v-if="isLoading"
      class="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div class="text-center">
        <UiSpinner size="xl" class="mx-auto text-primary" />
        <p class="mt-4 text-lg font-semibold text-white">Loading PDF...</p>
      </div>
    </div>

    <template v-if="!isLoading">
      <!-- Purchase Overlay -->
      <UiDialog :open="!isPurchased && currentPage >= previewLimit">
        <UiDialogContent
          hide-close
          class="rounded-xl sm:max-w-md"
          @pointer-down-outside.prevent
          @escape-key-down.prevent
        >
          <UiDialogTitle class="sr-only">Preview Limit Reached</UiDialogTitle>

          <div class="purchase-card px-2 py-4 text-center sm:px-4">
            <div class="lock-icon mb-4 text-8xl">🔒</div>
            <h2 class="mb-3 text-3xl font-bold">Preview Limit Reached</h2>
            <p class="mb-2 text-base text-muted-foreground">
              You've viewed all {{ previewLimit }} available preview pages
            </p>
            <p class="my-6 text-lg font-bold text-primary">
              Unlock all {{ totalPages }} pages with full access
            </p>
            <UiButton
              size="lg"
              class="purchase-btn rounded-lg shadow-lg"
              @click="goToPurchase"
            >
              <CreditCard class="mr-1 h-5 w-5" />
              Purchase Full Access
            </UiButton>
          </div>
        </UiDialogContent>
      </UiDialog>

      <!-- Controls Bar -->
      <header class="sticky top-0 z-10 border-b border-border bg-card shadow-sm">
        <div class="container mx-auto flex items-center justify-between px-6">
          <UiButton
            size="lg"
            class="nav-btn min-w-12 rounded-lg px-3 sm:min-w-[120px] sm:px-6"
            :disabled="!hasPdf || currentPage <= 1"
            @click="prevPage"
          >
            <ChevronLeft class="h-5 w-5" />
            <span class="hidden sm:inline">Previous</span>
          </UiButton>

          <div class="min-w-[100px] py-10 text-center sm:min-w-[150px]">
            <div class="flex items-center justify-center gap-2">
              <span class="text-3xl font-bold leading-none text-primary">
                {{ currentPage }}
              </span>
              <span class="text-2xl text-muted-foreground">/</span>
              <span class="text-2xl text-muted-foreground">
                {{ isPurchased ? totalPages : previewLimit }}
              </span>
            </div>
            <div v-if="!isPurchased" class="font-bold text-destructive">
              PREVIEW
            </div>
          </div>

          <UiButton
            size="lg"
            class="nav-btn min-w-12 rounded-lg px-3 sm:min-w-[120px] sm:px-6"
            :disabled="!hasPdf || !canGoNext"
            @click="nextPage"
          >
            <span class="hidden sm:inline">Next</span>
            <ChevronRight class="h-5 w-5" />
          </UiButton>
        </div>
      </header>

      <!-- PDF Viewer -->
      <main class="h-[calc(100vh-88px)] overflow-y-auto">
        <div class="container mx-auto flex justify-center px-4 py-8">
          <div class="rounded-xl bg-card p-4 shadow-lg sm:p-6">
            <canvas
              ref="pdfCanvas"
              class="block h-auto max-w-full rounded"
            ></canvas>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, CreditCard } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    pdfUrl: string;
    isPurchased?: boolean;
    previewLimit?: number;
    bookId?: string | number | null;
  }>(),
  {
    isPurchased: false,
    previewLimit: 20,
    bookId: null,
  }
);

const router = useRouter();

const currentPage = ref(1);
const totalPages = ref(0);
const isLoading = ref(true);
const hasPdf = ref(false);
const scale = 1.25;

const pdfCanvas = ref<HTMLCanvasElement | null>(null);

// pdf.js is loaded from a CDN at runtime; its objects stay non-reactive on purpose
let pdfjsLib: any = null;
let pdfDoc: any = null;

const canGoNext = computed(() =>
  props.isPurchased
    ? currentPage.value < totalPages.value
    : currentPage.value < props.previewLimit &&
      currentPage.value < totalPages.value
);

onMounted(() => {
  initPdfReader();
});

onBeforeUnmount(() => {
  if (pdfDoc) {
    try {
      pdfDoc.destroy();
    } catch {
      /* ignore */
    }
    pdfDoc = null;
  }
});

async function initPdfReader() {
  if (import.meta.client) {
    await loadPdfJsLibrary();
    await loadPdfDocument();
  }
}

function loadPdfJsLibrary(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      pdfjsLib = (window as any).pdfjsLib;
      configurePdfJs();
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;

    script.onload = () => {
      pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        reject(new Error("Failed to load PDF.js"));
        return;
      }
      configurePdfJs();
      resolve();
    };

    script.onerror = () => reject(new Error("Unable to load PDF.js library"));
    document.head.appendChild(script);
  });
}

function configurePdfJs() {
  if (pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  }
}

async function loadPdfDocument() {
  try {
    if (!pdfjsLib) throw new Error("PDF.js not loaded");

    const loadingTask = pdfjsLib.getDocument(props.pdfUrl);
    pdfDoc = await loadingTask.promise;

    totalPages.value = pdfDoc.numPages;
    hasPdf.value = true;
    isLoading.value = false;

    await nextTick();
    await renderPage(currentPage.value);
  } catch (err: any) {
    console.error("❌ Error loading PDF:", err.message);
    isLoading.value = false;
  }
}

async function renderPage(num: number) {
  if (!pdfDoc || !pdfCanvas.value) return;
  try {
    const page = await pdfDoc.getPage(num);
    const canvas = pdfCanvas.value;
    const ctx = canvas.getContext("2d");
    const viewport = page.getViewport({ scale });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
  } catch (err: any) {
    console.error(`❌ Error rendering page ${num}:`, err.message);
  }
}

async function nextPage() {
  if (!props.isPurchased && currentPage.value >= props.previewLimit) return;
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await renderPage(currentPage.value);
  }
}

async function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    await renderPage(currentPage.value);
  }
}

function goToPurchase() {
  router.push(props.bookId ? `/details/${props.bookId}` : "/");
}
</script>

<style scoped>
.nav-btn {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 149, 208, 0.4);
}

.nav-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Purchase Card Animations */
.purchase-card {
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.lock-icon {
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.purchase-btn {
  box-shadow: 0 6px 20px rgba(82, 149, 208, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.purchase-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(82, 149, 208, 0.5);
}

.purchase-btn:active {
  transform: translateY(-1px);
}
</style>
