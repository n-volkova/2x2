module.exports = {
  productionSourceMap: false,
  transpileDependencies: ['standardized-audio-context'],
  publicPath: process.env.NODE_ENV === 'production' ? '/2x2/' : '/'
};