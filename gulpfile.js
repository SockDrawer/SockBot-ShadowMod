'use strict';
const gulp = require('gulp'),
    istanbul = require('gulp-istanbul'),
    istanbulHarmony = require('istanbul-harmony'),
    mocha = require('gulp-mocha'),
    eslint = require('gulp-eslint');

const sockFiles = ['*.js', '!./gulpfile.js', '**/lib/**/*.js', '!node_modules/**', '!test/**'],
    sockTests = ['test/**/*.js'];

const CI = process.env.CI === 'true';

const testReporter = CI ? 'spec': 'dot';

/**
 * Run all js files through eslint and report status.
 */
gulp.task('lintCore', () => {
    return gulp.src(sockFiles)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/**
 * Run all tests through eslint and report status.
 */
gulp.task('lintTests', () => {
    return gulp.src(sockTests)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/**
 * Run code coverage instrumented tests
 */
gulp.task('test', ['lintCore', 'lintTests'], (done) => {
    gulp.src(sockFiles)
        // Instrument code files with istanbulHarmony
        .pipe(istanbul({
            instrumenter: istanbulHarmony.Instrumenter,
            includeUntested: true
        }))
        // hook require function for complete code coverage
        .pipe(istanbul.hookRequire())
        .on('finish', () => {
            // Run all tests
            gulp.src(sockTests)
                .pipe(mocha({
                    reporter: testReporter
                }))
                .on('error', done)
                // Write code coverage reports
                .pipe(istanbul.writeReports())
                .on('finish', done);
        });
});

// Meta tasks
gulp.task('default', ['lint'], () => 0);
gulp.task('lint', ['lintCore', 'lintTests'], () => 0);