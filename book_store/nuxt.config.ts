export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "shadcn-nuxt"],
  shadcn: {
    prefix: "Ui",
    componentDir: "./components/ui",
  },
  app: {
    head: {
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
        },
      ],
      script: [
        {
          // Apply the persisted/system theme before first paint (no FOUC)
          innerHTML: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||((!t||t==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`,
          tagPosition: "head",
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      // Backend API origin. Override with NUXT_PUBLIC_API_BASE.
      apiBase: "http://localhost:5000",
    },
  },
  pinia: {
    storesDirs: ["./stores/**"],
  },
  tailwindcss: {
    cssPath: "~/assets/styles/main.css",
  },
  typescript: {
    strict: true,
  },
});
