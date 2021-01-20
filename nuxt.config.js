import * as FontAwesome from './build/fontawesome'

export default {
  components: true,
  ssr: true,
  target: 'static',
  modern: 'client',
  head: {
    title: 'AxtFlightInfo - 秋田空港運行情報',
    meta: [
      { charset: 'utf-8' },
      { 'http-equiv': 'x-ua-compatible', content: 'ie=edge' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    script: [
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.2.5/polyfill.min.js' }
    ]
  },
  loading: { color: '#fff' },
  css: ['~/assets/css/main.scss'],
  plugins: [
    '@/plugins/opdt'
  ],
  buildModules: [
    ['@nuxtjs/fontawesome', { component: 'fontAwesome', suffix: true }],
    'nuxt-purgecss',
    '@nuxtjs/style-resources',
  ],
  fontawesome: {
    icons: {
      solid: FontAwesome.solid,
      regular: FontAwesome.regular,
      brands: FontAwesome.brands
    }
  },
  purgeCSS: {
    whitelistPatterns: [/svg-/, /fa-/, /.*\[disabled\].*/]
  },
  modules: [
    '@nuxtjs/bulma',
    '@nuxt/http'
  ],
  styleResources: {
    scss: ['~assets/css/vars.scss']
  },
  build: {
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    }
  },
  watchers: {
    webpack: {
      aggregateTimeout: 300,
      poll: 1000
    }
  },
  publicRuntimeConfig: {
    ODPT_CONSUMERKEY: process.env.ODPT_CONSUMERKEY
  }
}
