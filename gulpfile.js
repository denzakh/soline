var gulp = require('gulp');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
var notify = require("gulp-notify");
var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');
var server = require('gulp-server-livereload');
var less = require('gulp-less');
var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var ftp = require('gulp-ftp'); 
var realFavicon = require ('gulp-real-favicon');
var plumber = require('gulp-plumber');
var fs = require('fs');


/// Сборка проекта

// Очищаем папку dist
gulp.task('clean', function () {
  return gulp.src('dist', {read: false})
  .pipe(clean());
});

// копируем шрифты
gulp.task('fonts', ['clean'], function () {
  return gulp.src('app/fonts/*.*')
  .pipe(gulp.dest('dist/fonts/'))
});

// минифицируем графику и сохраняем в папку для
// продакшена, c предварительно добавленными шрифтами
gulp.task('image', ['fonts'], function () {
  return gulp.src('app/img/**')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/img/'))
});

// собираем весь проект для продакшена:
gulp.task('build', ['image'], function () {
  var assets = useref.assets();
  return gulp.src('app/*.html')
  .pipe(plumber()) // plumber
  .pipe(assets)
  .pipe(gulpif('*.js', uglify()))
  .pipe(gulpif('*.css', minifyCss()))
  .pipe(assets.restore())
  .pipe(useref())
  .pipe(gulp.dest('dist'))
});

// Отправка собранного проекта на хостинг:
// очищает папку dist, собирает в нее проект по новой и отправляет на хостинг
gulp.task('ftp', ['build'], function () {

  var ftpObj = {
          host: 'denzakh.ru',
          user: 'fenixx83_soline',
          pass: ''
      };  

  // чтение файла с паролем
  ftpObj.pass = fs.readFileSync('psw.txt','utf8');  

  return gulp.src('dist/**/*')
    .pipe(ftp(ftpObj))
});

// запуск локального сервера
// local server with livereload
gulp.task('webserver', function() {
  gulp.src('app')
  .pipe(server({
    livereload: true,
    directoryListing: false,
    open: true,
    defaultFile: 'index.html'
  }));
});

// Создание спрайтов - png and less files
gulp.task('sprite', function () {
  var spriteData = gulp.src('app/img/sprite/*.*')
  .pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../img/sprite.png',
    cssName: 'sprite.less'
  }));

  spriteData.img
  // .pipe(imagemin()) //графика будет минифицирована при сборке на продакшн
  .pipe(gulp.dest('app/img/'))
  .pipe(notify("Sprite rebuild!"));;

  return spriteData.css
  .pipe(gulp.dest('app/less/'));
});

// Компиляция less. 
// При ошибке в компиляции падает gulp, нужен перезапуск
gulp.task('less', function () {
  return gulp.src('app/less/style.less')
  .pipe(less())
  .pipe(autoprefixer({
    browsers: ['last 5 versions'],
    cascade: false
  }))
    .pipe(minifyCss())
    .pipe(rename('style.min.css'))
  .pipe(gulp.dest('app/css'))
  .pipe(notify("Less скомпилирован!"));
});

// Отслеживаем изменения в проекте 
// less перекомпилирует по новой css,
// sprite отслеживает появление новой графики для переклеивания спрайта
gulp.task('watch', function (){
  gulp.watch('app/less/**/*.less', ['less']);
  gulp.watch('app/img/sprite/*.*', ['sprite']);
});

gulp.task('default', ['webserver', 'sprite', 'less', 'watch']);
