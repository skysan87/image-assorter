// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

console.log('NODE_ENV:', process.env.NODE_ENV)
const isPrd = process.env.NODE_ENV === 'production'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  srcDir: 'src',
  ssr: false,
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      movie: ['.mp4']
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ]
  },
  app: {
    baseURL: isPrd ? '.' : '/',
  },
  nitro: {
    output: {
      publicDir: '../app/dist'
    }
  }
})
