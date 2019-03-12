
const { src, dest } = require('gulp')

module.exports = function statics() {
  return src([
    'app/assets/**',
    'app/index.html',
    'app/restaurant.html',
    'app/sw.js',
    'app/manifest.json'
  ]).pipe(dest('dist/'))
}