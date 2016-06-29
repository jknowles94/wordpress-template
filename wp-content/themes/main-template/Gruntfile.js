// To check for new package updates see https://www.npmjs.com/package/npm-check-updates
module.exports = function (grunt) {

    // Configurable options
    var config = {
        sassPath:       'assets/sass',
        imagesPath:     'assets/images',
        jsPath:         'assets/scripts',
        sourcemap:      false
    };

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Project options
        config: config,

        // Compass options used to compile SASS into CSS
        compass: {
            dev: {
                options: {
                    sassDir: '<%= config.sassPath %>',
                    cssDir: '../main-template/',
                    environment: 'development',
                    sourcemap: '<%= config.sourcemap %>'
                }
            },
            live: {
                options: {
                    sassDir: '<%= config.sassPath %>',
                    cssDir: '../main-template/',
                    environment: 'production'
                }
            }
        },

        // Updated version of Autoprefixer uses postcss instead
        postcss: {
          options: {
            map: '<%= config.sourcemap %>',
            processors: [
              require('autoprefixer')({browsers: ['last 2 version']})
            ]
          },
          dist: {
            files: [{
                expand: true,
                src: 'style.css',
                cwd: '../main-template/',
                dest: '../main-template/'
            }]
          }
        },

        // Watchs files for changes then compiles and reloads the browser
        watch: {

            html: {
                files: ['templates/index.html','templates/styleguide.html','templates/template.html'],
                options: {
                    livereload: true
                }
            },

            compass: {
                files: ['<%= config.sassPath %>/{,*/}*.{scss,sass}'],
                tasks: ['compass:dev', 'postcss', 'notify:compass'],
                options: {
                    livereload: true
                }
            },

            jshint: {
                files: ['<%= config.jsPath %>/main.js'],
                tasks: ['jshint']
            }

        },

        browserSync: {
            dev: {
                bsFiles: {
                    src : 'style.css'
                },
                options: {
                    proxy: 'http://my-site.local',
                    watchTask: true
                }
            }
        },

        // Checks JS file for errors
        jshint: {
            all: ['<%= config.jsPath %>/main.js'],
            options: {
                '-W099': true, // Stops mixed tabs and spaces error
            },
        },

        // Clean any pre-commit hooks in .git/hooks directory
        clean: {
            precommit: ['.git/hooks/pre-commit'],
            pull: ['.git/hooks/post-merge']
        },

        shell: {
            precommit: {
                command: 'cp git-hooks/pre-commit .git/hooks/'
            },
            pull: {
                command: 'cp git-hooks/post-merge .git/hooks/'
            }
        },

        notify: {
            compass: {
              options: {
                title: 'Wooden Spoon', 
                message: 'Compass compiled',
              }
            }
        },


        // Reads the js files from the specified html file and generates the concat & uglify config, run with grunt buildJS
        useminPrepare: {
            html: 'templates/template.html'
        },

        // Conatenates files
        concat: {
            build: {
                files: [ 
                    { dest: 'assets/scripts/plugins.js',
                    
                    src: 
                        [ 
                             'bower_components/SimpleStateManager/dist/ssm.min.js',
                             'bower_components/jquery-colorbox/jquery.colorbox-min.js',
                             'bower_components/bootstrapValidator/dist/js/bootstrapValidator.min.js',
                             'bower_components/respond/dest/respond.min.js',
                        ] 
                    } 
                ]
            }
        },

        // Minifies JS files
        uglify: {
            build: {
                files: {
                    '<%= config.jsPath %>/plugins.min.js': ['<%= config.jsPath %>/plugins.js'],
                    '<%= config.jsPath %>/main.min.js': ['<%= config.jsPath %>/main.js'],
                    '<%= config.jsPath %>/modernizr.min.js': ['<%= config.jsPath %>/modernizr.js']
                }
            }
        },

        // Minifies CSS files
        cssmin: {
            build: {
                files: {
                    'style.min.css': ['style.css']
                }
            }
        }

    });

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Default task(s)
    grunt.registerTask('default', ['compass:dev', 'postcss']);
    grunt.registerTask('watchsync', ['browserSync', 'watch']);
    grunt.registerTask('setup', ['clean:precommit','shell:precommit','clean:pull','shell:pull']);
    grunt.registerTask('live', ['jshint', 'uglify', 'compass:live', 'postcss', 'cssmin']);
    grunt.registerTask('buildJS', ['useminPrepare','concat:generated']);
};