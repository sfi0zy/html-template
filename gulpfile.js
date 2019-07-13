const gulp         = require('gulp');
const $            = require('gulp-load-plugins')();
const fs           = require('fs');
const path         = require('path');
const argv         = require('yargs').argv;
const webpack      = require('webpack-stream');
const critical     = require('critical').stream;
const browserSync  = require('browser-sync').create();
const dss          = require('./gulp-dss.js');



require('colors');



const pkg         = JSON.parse(fs.readFileSync('./package.json'));
const ENVIRONMENT = argv.production ? 'production' : 'development';



// -----------------------------------------------------------------------------
//  INFO
// -----------------------------------------------------------------------------


console.log(`${(new Date()).toString().white}\n`);
console.log(`> ${argv.$0} ${argv._}`);
console.log(ENVIRONMENT.toUpperCase().yellow);
console.log(`${pkg.name.red} ${pkg.version.green}\n`);
console.log('%s\n'.blue, pkg.browserslist);

let isDependenciesSaved = true;

if (pkg.dependencies) {
    console.log('DEPENDENCIES:');

    Object.keys(pkg.dependencies).forEach((dependency) => {
        const depPackage = JSON.parse(
            fs.readFileSync(
                path.join('node_modules', dependency, 'package.json'), 'utf-8'));

        if (depPackage._requested.registry) {
            if (depPackage.version !== pkg.dependencies[dependency]) {
                console.log('NPM %s@%s'.green, dependency, depPackage.version.red);
                isDependenciesSaved = false;
            } else {
                console.log('NPM %s@%s'.green, dependency, depPackage.version);
            }
        } else {
            if (depPackage._resolved !== pkg.dependencies[dependency]) {
                console.log('--- %s@%s'.blue, dependency, depPackage._resolved.red);
                isDependenciesSaved = false;
            } else {
                console.log('--- %s@%s'.blue, dependency, depPackage._resolved);
            }
        }
    });
}


console.log('\nDEV DEPENDENCIES:');

Object.keys(pkg.devDependencies).forEach((dependency) => {
    const depPackage = JSON.parse(
        fs.readFileSync(
            path.join('node_modules', dependency, 'package.json'), 'utf-8'));

    if (depPackage._requested.registry) {
        if (depPackage.version !== pkg.devDependencies[dependency]) {
            console.log('NPM %s@%s'.green, dependency, depPackage.version.red);
            isDependenciesSaved = false;
        } else {
            console.log('NPM %s@%s'.green, dependency, depPackage.version);
        }
    } else {
        if (depPackage._resolved !== pkg.devDependencies[dependency]) {
            console.log('--- %s@%s'.blue, dependency, depPackage._resolved.red);
            isDependenciesSaved = false;
        } else {
            console.log('--- %s@%s'.blue, dependency, depPackage._resolved);
        }
    }
});

if (!isDependenciesSaved) {
    console.log('Dependencies in the package.json are not saved correctly.'.red);
    console.log('Run `npm run save-installed` to fix it.'.red);
}

console.log('\n\n\n');



// -----------------------------------------------------------------------------
//  BUILD
// -----------------------------------------------------------------------------



gulp.task('build:lint-js', () => {
    return gulp.src('./src/**/*.js')
        .pipe($.eslint())
        .pipe($.eslint.format());
});


gulp.task('build:compile-js', () => {
    return gulp.src('./src/main.js')
        .pipe(webpack(require('./webpack.config.js')[ENVIRONMENT]))
        .pipe($.rename('main.min.js'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.stream());
});


gulp.task('build:compile-less', () => {
    return gulp.src('./src/main.less')
        .pipe($.if(ENVIRONMENT === 'development', $.sourcemaps.init()))
        .pipe($.less())
        .pipe($.postcss())
        .pipe($.if(ENVIRONMENT === 'development', $.sourcemaps.write()))
        .pipe($.rename('main.min.css'))
        .pipe($.size({ showFiles: true }))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});


gulp.task('build:pages', () => {
    return gulp.src('src/pages/*.pug')
        .pipe($.pug({ pretty: true }))
        .pipe($.realFavicon.injectFaviconMarkups(
            JSON.parse(fs.readFileSync('faviconData.json')).favicon.html_code))
        .pipe($.injectSvg())
        .pipe(critical(require('./critical.config.js')))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
});


gulp.task('build:docs', () => {
    return gulp.src('./src/components/**/*.less')
        .pipe(dss({
            pkg,
            templatePath: './src/docs',
            parsers: require('./dss.parsers.js'),
            outputPath: './dist/docs'
        }))
        .pipe(gulp.dest('./dist/docs'))
        .pipe(browserSync.stream());
});


gulp.task('build:favicon', (done) => {
    $.realFavicon.generateFavicon(
        require('./favicon.config.js'), () => {
            done();
        }
    );
});


gulp.task('build', gulp.series(
    'build:lint-js',
    'build:compile-js',
    'build:compile-less',
    'build:favicon',
    'build:pages',
    'build:docs'
));



// -----------------------------------------------------------------------------
//  COPY FILES
// -----------------------------------------------------------------------------

gulp.task('copy:muilessium', (done) => {
    gulp.src('node_modules/muilessium/dist/muilessium-ui.min.css')
        .pipe(gulp.dest('dist/css'));
    gulp.src('node_modules/muilessium/dist/muilessium.min.js')
        .pipe(gulp.dest('dist/js'));
    gulp.src('node_modules/muilessium/dist/muilessium-ui.min.js')
        .pipe(gulp.dest('dist/js'));

    done();
});


gulp.task('copy:images', () => {
    return gulp.src('src/images/*')
        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.stream());
});


gulp.task('copy', gulp.series(
    'copy:muilessium',
    'copy:images'
));



// -----------------------------------------------------------------------------
//  CLEAN ./DIST
// -----------------------------------------------------------------------------

gulp.task('clean-dist', () => {
    return gulp.src('./dist/*', { read: false })
        .pipe($.clean());
});



// -----------------------------------------------------------------------------
//  BROWSER-SYNC
// -----------------------------------------------------------------------------

gulp.task('browser-sync', () => {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        files: ['./src/**']
    });

    gulp.watch([
        './src/**/*.js',
    ], gulp.series('build:compile-js'));

    gulp.watch([
        './src/**/*.less',
    ], gulp.series('build:compile-less', 'build:docs'));

    gulp.watch([
        './src/pages/**/*.pug'
    ], gulp.series('build:pages'));

    gulp.watch([
        './src/docs/*.pug'
    ], gulp.series('build:docs'));
});


// -----------------------------------------------------------------------------
//  DEFAULTS
// -----------------------------------------------------------------------------

gulp.task('default', (done) => {
    switch (ENVIRONMENT) {
        case 'production': {
            gulp.series(
                'clean-dist',
                'copy',
                'build'
            )();

            break;
        }

        case 'development': {
            gulp.series(
                'clean-dist',
                'copy',
                'build',
                'browser-sync'
            )();

            break;
        }

        default: {
            break;
        }
    }

    done();
});

