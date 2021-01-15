import * as FontAwesome from './build/fontawesome'

export default {
  components: true,
  ssr: true,
	target: 'static',
  head: {
    title: 'AxtFlightInfo - 秋田空港運行情報',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
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
    "@nuxtjs/axios"
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
