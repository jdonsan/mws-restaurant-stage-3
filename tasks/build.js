const gulp = require('gulp')
const source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer');
const rename = require('gulp-rename')
const browserify = require('browserify')
const es = require('event-stream')
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');

module.exports = function build(done) {
  const files = [
    { path: './app/src/main.js', name: 'main.min.js' },
    { path: './app/src/restaurant_info.js', name: 'restaurant_info.min.js' }
  ]

  const tasks = files.map(function (entry) {
    return browserify({ entries: [entry.path], debug: true })
      .transform("babelify", { presets: ["@babel/preset-env"], sourceMaps: true })
      .bundle()
      .pipe(source(entry.path))
      .pipe(buffer())
      .pipe(rename(entry.name))
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js'))
  })

  es.merge(tasks).on('end', done);
}