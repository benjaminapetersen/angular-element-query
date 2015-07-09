var gulp = require('gulp'),
  gutil = require('gulp-util'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  rimraf = require('gulp-rimraf');

gulp.task('clean', function() {
  return gulp.src('./dist/**/*.js', {read: false})
         .pipe(rimraf());
});

// just make it a little prettier, my source is a mess of comments.
gulp.task('build', ['clean'], function () {
  return gulp.src([
      './src/resize-listener.js',
      './src/element-query.js',
      './src/element-query-utils.js',
      './src/element-query-resize-listener.js'
    ])
    .pipe(concat('element-query.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('min', ['build'], function() {
    return gulp.src('./dist/element-query.js')
            .pipe(rename('element-query.min.js'))
            .pipe(uglify().on('error', gutil.log))
            .pipe(gulp.dest('dist'));
})

gulp.task('default', ['min']);
