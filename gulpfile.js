var gulp = require('gulp'),
    less = require('gulp-less'),
    cssmin = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    plumber = require('gulp-plumber'),
    babel = require('gulp-babel'),
    jsmin = require('gulp-uglify');
gulp.task("Less",function () {
    gulp.src("src/less/*.less")
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')}))
        .pipe(less())
        .pipe(cssmin())
        .pipe(gulp.dest('public/stylesheets'));
});

gulp.task("Babel",function () {
    gulp.src("src/scripts/*.js")
        .pipe(plumber({errorHandler: notify.onError('Error: <%= error.message %>')})) //错误提示，不终止编译器运行
        .pipe(babel({
            presets:['es2015']
        }))
        .pipe(jsmin())
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task("Watch",function () {
    gulp.watch("src/less/*.less",["Less"]);
    gulp.watch("src/scripts/*.js",["Babel"]);
});
