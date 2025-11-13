module.exports = {
  productionSourceMap: false,
  
  pluginOptions: {
    i18n: {
      locale: 'de',
      fallbackLocale: 'de',
      localeDir: 'js/lang',
      enableInSFC: true,
      silentFallbackWarn: process.env.NODE_ENV === 'production',
    }
  },

  transpileDependencies: [
    'vuetify'
  ],

  configureWebpack: {
    output: {
      filename: process.env.NODE_ENV === 'production' ? 'js/[name].[contenthash:6].js' : 'js/[name].[hash:6].js',
      chunkFilename: process.env.NODE_ENV === 'production' ? 'js/[name].[contenthash:6].js' : 'js/[name].[hash:6].js',
    }
  },

  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "~@/sass/variables.scss"`,
      },

      scss: {
        additionalData: `@import "~@/sass/variables.scss";`,
      }
    }
  }
}
