const { src, dest, watch, series, parallel } = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
var sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const browserSync = require("browser-sync").create();
const wait = require('gulp-wait')

// Sökvägar
const files = {
    htmlPath: "src/**/*.html", // Ex. alla filer med ändelsen .html
    jsPath: "src/**/*.js",
    sassPath: "src/**/*.scss",
    imgPath: "src/images/*"
}

// Kopierar HTML-filer och lägger dom i pub-mappen
function copyHTML() {
    return src(files.htmlPath)
        .pipe(dest('pub')
        );
}

// Sammanslår och minifierar JS-filer och lägger dom i pub-mappen
function jsTask() {
    return src(files.jsPath)
        .pipe(concat('main.js')) 
        .pipe(uglify())
        .pipe(dest('pub/js')
        );
}

// Sammanslår och minifierar SASS-filer och lägger dom i pub-mappen
function sassTask() {
    return src(files.sassPath)
    .pipe(wait(500))
    .pipe(sourcemaps.init())
    .pipe( sass({
        errorLogToConsole: true,
        outputStyle: 'compressed'
        }) )
    .pipe(concat('main.css'))
    .pipe(dest('pub/css'))
    .pipe(browserSync.reload({ stream:true }));
}

// Minifierar bilder och lägger dom i pub-mappen
function imgTask() {
    return src(files.imgPath)
        .pipe(imagemin())
        .pipe(dest('pub/images')
        );
}

// Watcher, kör tasks när ändringar görs 
function watchTask() {
    // Skapar en live-server
    browserSync.init({
        injectChanges: false,
        server: {
            baseDir: "./pub"
        }
    });
    watch([files.htmlPath, files.jsPath, files.sassPath, files.imgPath],
        parallel(copyHTML, jsTask, sassTask, imgTask)).on('change', browserSync.reload);
}

// Default task
exports.default = series(
    parallel(copyHTML, jsTask, sassTask, imgTask),
    watchTask
);