// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:7000'
    }
  },
  css: [
    'vuetify/styles',
    '~/assets/css/tailwind.css'
  ],
  build: {
    transpile: ['vuetify']
  },
  vite: {
    ssr: {
      noExternal: ['vuetify']
    },
    plugins: [
      vuetify({ autoImport: true })
    ],
    vue: {
      template: {
        transformAssetUrls
      }
    }
  }
})
