<template>
  <div class="relative h-screen bg-muted">
    <div
      v-if="isLoading"
      class="absolute inset-0 z-50 flex items-center justify-center bg-background/85"
    >
      <div class="text-center">
        <UiSpinner size="lg" class="mx-auto text-foreground" />
        <p class="eyebrow mt-5">Opening the book</p>
      </div>
    </div>

    <template v-if="!isLoading">
      <UiDialog :open="!isPurchased && hasPdf && currentPage >= totalPages">
        <UiDialogContent
          hide-close
          class="w-[calc(100%-2rem)] gap-0 p-0 shadow-none sm:max-w-md"
          @pointer-down-outside.prevent
          @escape-key-down.prevent
        >
          <div class="purchase-card px-8 py-10">
            <p class="eyebrow">Preview</p>
            <UiDialogTitle class="mt-5 font-serif text-3xl font-normal leading-tight tracking-[-0.02em]">
              That's the end of the <span class="italic">preview.</span>
            </UiDialogTitle>
            <p class="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              You've read all {{ totalPages }} preview pages. The ebook unlocks all
              {{ fullPageCount ?? totalPages }} pages.
            </p>
            <UiButton variant="ink" size="cta" block class="mt-8 shadow-none" @click="goToPurchase">
              Buy the ebook
            </UiButton>
          </div>
        </UiDialogContent>
      </UiDialog>

      <header class="sticky top-0 z-10 border-b border-border bg-background">
        <div class="container mx-auto flex h-[72px] max-w-5xl items-center justify-between px-4">
          <button
            type="button"
            class="group inline-flex h-10 items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] disabled:pointer-events-none disabled:opacity-30"
            :disabled="!hasPdf || currentPage <= 1"
            @click="prevPage"
          >
            <ArrowLeft class="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span class="hidden sm:inline">Previous</span>
          </button>

          <div class="text-center">
            <p class="font-serif text-2xl leading-none tabular-nums">
              {{ currentPage }}<span class="mx-2 text-muted-foreground">/</span><span class="text-muted-foreground">{{ totalPages }}</span>
            </p>
            <p v-if="!isPurchased" class="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Preview
            </p>
          </div>

          <button
            type="button"
            class="group inline-flex h-10 items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] disabled:pointer-events-none disabled:opacity-30"
            :disabled="!hasPdf || !canGoNext"
            @click="nextPage"
          >
            <span class="hidden sm:inline">Next</span>
            <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </header>

      <main class="h-[calc(100vh-72px)] overflow-y-auto">
        <div class="container mx-auto flex justify-center px-4 py-10">
          <div class="ed-cover bg-card">
            <canvas ref="pdfCanvas" class="block h-auto max-w-full"></canvas>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    pdfUrl: string;
    httpHeaders?: Record<string, string>;
    isPurchased?: boolean;
    fullPageCount?: number | null;
    bookId?: string | number | null;
  }>(),
  {
    httpHeaders: undefined,
    isPurchased: false,
    fullPageCount: null,
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

const canGoNext = computed(() => currentPage.value < totalPages.value);

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

    const loadingTask = pdfjsLib.getDocument({
      url: props.pdfUrl,
      httpHeaders: props.httpHeaders,
    });
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
  if (canGoNext.value) {
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
.purchase-card {
  animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(16px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
