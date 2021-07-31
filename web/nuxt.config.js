const developConfig = {
  ssr: false,

  target: 'static',

  head: {
    title: 'image-assorter',
    htmlAttrs: {
      lang: 'ja'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  css: [
    '@/assets/css/tailwind.css'
  ],

  plugins: [
  ],

  components: true,

  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/tailwindcss'
  ],

  modules: [
  ],

  build: {
  }
}

const productionConfig = {
  ...developConfig,

  router: {
    ...developConfig.router,
    base: './',
    mode: 'hash'
  },

  generate: {
    ...developConfig.generate,
    dir: '../app/dist'
  },

  build: {
    ...developConfig.build
  }
}

const config = process.env.NODE_ENV === 'production' ? productionConfig : developConfig

export default config
