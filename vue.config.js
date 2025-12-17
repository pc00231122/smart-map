const { defineConfig } = require('@vue/cli-service')
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  outputDir: 'dist',
  assetsDir: 'static',
  productionSourceMap: false,
  
  devServer: {
    port: 8080,
    open: true,
    host: 'localhost',
    proxy: {
      '/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        pathRewrite: {
          '^/nominatim': ''
        },
        headers: {
          'User-Agent': 'SmartMapApp/1.0'
        }
      },
      '/overpass': {
        target: 'https://overpass-api.de',
        changeOrigin: true,
        pathRewrite: {
          '^/overpass': ''
        }
      },
      '/weather': {
        target: 'https://api.open-meteo.com',
        changeOrigin: true,
        pathRewrite: {
          '^/weather': ''
        }
      }
    }
  },
  
  configureWebpack: {
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  },
  
  chainWebpack: config => {
    // 配置SVG图标
    config.module
      .rule('svg')
      .exclude.add(/node_modules/)
      .end()
      
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(/src\/icons/)
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
})