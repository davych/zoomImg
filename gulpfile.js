var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('script', function () {
    // 1. 找到文件
    gulp
        .src('index.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
})
