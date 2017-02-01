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
                        return 'python build.py'
                    } else {
                        return 'python build.py ' + arch;
                    }
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    compress: true,
                },
                files: {
                    'dist/unicorn.min.js': [
                        'src/**/*.js'
                    ]
                }
            }
        },
        concat: {
            dist: {
                src: [
                    '<%= lib.src %>',
                    'src/unicorn.js',
                    'src/unicorn-arm.js',
                    'src/unicorn-arm64.js',
                    'src/unicorn-m68k.js',
                    'src/unicorn-mips.js',
                    'src/unicorn-sparc.js',
                    'src/unicorn-x86.js',
                ],
                dest: '<%= lib.dist %>'
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
            building: {
                files: [
                    'src/*.js',
                ],
                tasks: ['concat'],
            },
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
            grunt.config.set('lib.src', 'src/libunicorn.out.js');
            grunt.config.set('lib.dist', 'dist/unicorn.min.js');
            grunt.task.run('exec:emscripten');
            grunt.task.run('concat');
        } else {
            grunt.config.set('lib.src', 'src/libunicorn-'+arch+'.out.js');
            grunt.config.set('lib.dist', 'dist/unicorn-'+arch+'.min.js');
            grunt.task.run('exec:emscripten:'+arch);
            grunt.task.run('concat');
        }
    });
    grunt.registerTask('release', [
        'build',
        'build:arm',
        'build:aarch64',
        'build:mips',
        'build:m68k',
        'build:sparc',
        'build:x86',
    ]);
    grunt.registerTask('serve', [
        'connect',
        'watch'
    ]);
};
