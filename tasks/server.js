const { watch } = require('gulp')
const browserSync = require('browser-sync').create()

module.exports = function server() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  })

  watch(['./dist/**/*.js', './dist/*.html', './dist/css/styles.css']).on('change', browserSync.reload)
}