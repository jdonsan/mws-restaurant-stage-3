const { src, dest } = require('gulp')

module.exports = function styles() {
  return src([
    'app/assets/css/**'
  ]).pipe(dest('dist/css/'))
}