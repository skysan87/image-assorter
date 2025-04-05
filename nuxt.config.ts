// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

// console.log('NODE_ENV:', process.env.NODE_ENV)
const isPrd = false // FIXME

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  srcDir: 'src-web/src',
  ssr: false,
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      movie: ['.mp4']
    }
  },
  vite: {
    // Tauri CLI 出力のサポート強化
    clearScreen: false,
    // 環境変数の有効化
    // @see https://v2.tauri.app/reference/environment-variables/
    envPrefix: ['VITE_', 'TAURI_'],
    server: {
      // Tauriは一貫性のあるポートが必要
      strictPort: true,
    },
    plugins: [
      tailwindcss(),
    ]
  },
  router: {
    options: {
      // NOTE: 有効にしないとelectronでpage not foundエラー
      hashMode: isPrd
    }
  },
  // app: {
  //   // NOTE: electronでは相対パスを利用
  //   baseURL: isPrd ? '.' : '/',
  // },
  // nitro: {
  //   output: {
  //     publicDir: '../app/dist'
  //   }
  // }
})
