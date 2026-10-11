<template>
  <div class="flex min-h-[100dvh] flex-col bg-canvas">
    <header
      class="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6"
    >
      <NuxtLink
        to="/"
        class="rounded-md text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="THBookStore home"
      >
        <AuthBrandMark />
      </NuxtLink>
      <ThemeToggle />
    </header>

    <main class="flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:items-center sm:pt-0">
      <slot />
    </main>
  </div>
</template>
