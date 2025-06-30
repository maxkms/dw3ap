const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  publicPath: process.env.NODE_ENV === 'production' ? '/movies-app/' : '/',
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },
  chainWebpack: config => {
    config.module.rules.delete('eslint')
    config.plugins.delete('eslint')
  },
  devServer: {
    port: 8080,
    open: true
  }
})