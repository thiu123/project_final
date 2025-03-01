import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    'vuetify-nuxt-module',
    'nuxt3-vuex-module',
  ],
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
							waterblue:"#5295D0",
              customblack: "#191b24",
              customyellow: "#DCF763",
              darkgreen: "#435058",
              whitesmoke:"#F1F2EE"
						}
					}
				}
			}
    }
  }
})
