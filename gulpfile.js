const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer').default;
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');

function styles() {
    return src('src/scss/style.scss')
        .pipe(scss({ style: 'compressed' }))
        .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
        .pipe(concat('style.min.css'))
        .pipe(dest('src/css'))
        .pipe(browserSync.stream());
}

function scripts() {
    return src('src/js/script.js')
        .pipe(concat('script.min.js'))
        .pipe(uglify())
        .pipe(dest('src/js'))
        .pipe(browserSync.stream());
}

function images() {
    return src([
        'src/img/src/**/*.*',
        '!src/img/src/**/*.svg',
    ], { base: 'src/img/src', encoding: false })
        .pipe(newer('src/img'))
        .pipe(avif())

        .pipe(src('src/img/src/**/*.*', { base: 'src/img/src', encoding: false }))
        .pipe(newer('src/img'))
        .pipe(webp())

        .pipe(src('src/img/src/**/*.*', { base: 'src/img/src', encoding: false }))
        .pipe(newer('src/img'))
        .pipe(imagemin())

        .pipe(dest('src/img'));
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "src/"
        }
    });
    watch(['src/scss/**/*.scss'], styles);
    watch(['src/js/script.js'], scripts);
    watch(['src/**/*.html']).on('change', browserSync.reload);
    watch(['src/img/src/**/*'], images);
}

function cleanDist() {
    return src('dist/*')
        .pipe(clean());
}

function building() {
    return src([
        'src/css/style.min.css',
        'src/js/script.min.js',
        'src/icons/**/*',
        'src/img/*.*',
        '!src/img/src/**/*.*',
        'src/fonts/*.*',
        'src/**/*.html'
    ], { base: 'src', encoding: false })
        .pipe(dest('dist'));
}



exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.watching = watching;
exports.build = series(cleanDist, building);

exports.default = parallel(styles, scripts, images, watching);