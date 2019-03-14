'use strict';

const { series, watch } = require('gulp')
const build = require('./tasks/build')
const server = require('./tasks/server')
const statics = require('./tasks/statics')
const styles = require('./tasks/styles')

watch(['app/**/*.js'], build)
watch(['app/**/*.html'], statics)
watch(['app/**/*.css'], styles)

exports.build = build
exports.server = server
exports.statics = statics
exports.styles = styles

exports.default = series(statics, build, server)
