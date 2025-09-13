import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["vuetify-nuxt-module", "nuxt3-vuex-module"],
  css: ["@/assets/styles/main.css"],
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Geist:wght@100;200;300;400;500;600;700;800;900&display=swap",
        },
      ],
    },
  },
  vuetify: {
    moduleOptions: {
      /* module specific options */
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: "myTheme",
        themes: {
          myTheme: {
            colors: {
              waterblue: "#5295D0",
              customblack: "#191b24",
              customyellow: "#DCF763",
              darkgreen: "#435058",
              lightgreen: "#059669",
              whitesmoke: "#F1F2EE",
            },
            variables: {
              "font-family": "Geist, sans-serif",
            },
          },
        },
      },
    },
  },
});
