<template>
  <div class="container mx-auto max-w-7xl px-4 py-8 md:py-12" aria-busy="true">
    <UiSkeleton class="mb-8 h-4 w-56" />
    <div class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
      <UiSkeleton class="mx-auto aspect-square w-full sm:aspect-[4/5] max-w-[540px] rounded-[2rem] lg:col-span-5" />
      <div class="space-y-5 lg:col-span-7">
        <div class="flex gap-2">
          <UiSkeleton class="h-6 w-20 rounded-full" />
          <UiSkeleton class="h-6 w-24 rounded-full" />
        </div>
        <UiSkeleton class="h-12 w-full" />
        <UiSkeleton class="h-12 w-2/3" />
        <UiSkeleton class="h-5 w-40" />
        <UiSkeleton class="h-14 w-48" />
        <div class="grid grid-cols-2 gap-3">
          <UiSkeleton class="h-20 rounded-2xl" />
          <UiSkeleton class="h-20 rounded-2xl" />
        </div>
        <div class="flex gap-3">
          <UiSkeleton class="h-12 w-36 rounded-full" />
          <UiSkeleton class="h-12 grow rounded-full" />
          <UiSkeleton class="h-12 grow rounded-full" />
        </div>
      </div>
    </div>
  </div>
</template>
