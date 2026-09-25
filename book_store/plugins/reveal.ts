import type { Directive } from "vue";

type RevealElement = HTMLElement & { __revealObserver__?: IntersectionObserver };

export default defineNuxtPlugin((nuxtApp) => {
  const reveal: Directive<RevealElement, number | undefined> = {
    getSSRProps: () => ({ "data-reveal": "" }),
    mounted(el, binding) {
      el.setAttribute("data-reveal", "");
      if (binding.value) el.style.setProperty("--reveal-delay", `${binding.value}ms`);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || !("IntersectionObserver" in window)) {
        el.setAttribute("data-revealed", "");
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            el.setAttribute("data-revealed", "");
            observer.disconnect();
          }
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      observer.observe(el);
      el.__revealObserver__ = observer;
    },
    unmounted(el) {
      el.__revealObserver__?.disconnect();
    },
  };

  nuxtApp.vueApp.directive("reveal", reveal);
});
