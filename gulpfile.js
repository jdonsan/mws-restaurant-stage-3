'use strict';

const { series, watch  } = require('gulp')
const build = require('./tasks/build')
const server = require('./tasks/server')
const statics = require('./tasks/statics')

watch(['app/**/*.js'], build)
watch(['app/**/*.html'], statics)

exports.build = build
exports.server = server
exports.statics = statics

exports.default = series(statics, build, server)
