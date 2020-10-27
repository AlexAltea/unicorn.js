'use strict';

module.exports = function (grunt) {
    // Load tasks from grunt-* dependencies in package.json
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take
    require('time-grunt')(grunt);

    // Project configuration
    grunt.initConfig({
        exec: {
            emscripten: {
                cmd: function (arch) {
                    if (typeof arch === 'undefined') {
                        return 'python build.py build'
                    } else {
                        return 'python build.py build ' + arch;
                    }
                }
            }
        },
        concat: {
            dist: {
                src: [
                    'src/libunicorn<%= lib.suffix %>.out.js',
                    'src/libelf-integers.js',
                    'src/unicorn-wrapper.js',
                    'src/unicorn-constants.js',
                ],
                dest: 'dist/unicorn<%= lib.suffix %>.min.js'
            }
        },
        connect: {
            options: {
                port: 9001,
                livereload: 35729,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true
                }
            }
        },
        watch: {
            livereload: {
                files: [
                    '*.html',
                    '*.css',
                    '*.js',
                    'demos/*.html',
                    'demos/*.css',
                    'demos/*.js',
                    'dist/*.js',
                ],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
        }
    });

    // Project tasks
    grunt.registerTask('build', 'Build for specific architecture', function (arch) {
        if (typeof arch === 'undefined') {
            grunt.config.set('lib.suffix', '');
            grunt.task.run('exec:emscripten');
            grunt.task.run('concat');
        } else {
            grunt.config.set('lib.suffix', '-'+arch);
            grunt.task.run('exec:emscripten:'+arch);
            grunt.task.run('concat');
        }
    });
    grunt.registerTask('release', [
        'build',
        'build:aarch64',
        'build:arm',
        'build:mips',
        'build:m68k',
        'build:sparc',
        'build:x86',
    ]);
    grunt.registerTask('serve', [
        'connect',
        'watch',
    ]);
};
