const browserSync = require('browser-sync').create()

module.exports = function server() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  })
}