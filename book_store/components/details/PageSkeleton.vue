<template>
  <div class="container mx-auto max-w-7xl px-4 pt-8 md:pt-12" aria-busy="true">
    <UiSkeleton class="mb-10 h-3 w-56 rounded-none" />
    <div class="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
      <UiSkeleton class="aspect-[4/5] w-full rounded-none lg:col-span-7" />
      <div class="space-y-5 lg:col-span-5">
        <UiSkeleton class="h-3 w-24 rounded-none" />
        <UiSkeleton class="h-14 w-full rounded-none" />
        <UiSkeleton class="h-14 w-2/3 rounded-none" />
        <UiSkeleton class="h-5 w-40 rounded-none" />
        <UiSkeleton class="mt-8 h-10 w-36 rounded-none" />
        <div class="grid grid-cols-2 gap-3 pt-4">
          <UiSkeleton class="h-16 rounded-none" />
          <UiSkeleton class="h-16 rounded-none" />
        </div>
        <UiSkeleton class="h-12 w-full rounded-none" />
        <UiSkeleton class="h-12 w-full rounded-none" />
      </div>
    </div>
  </div>
</template>
