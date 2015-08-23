module.exports = function(grunt) {

  grunt.initConfig({

    watch: {
      files: ['app/**/*', 'test/**/*', 'config/**/*'],
      tasks: ['jshint', 'copy', 'concat', 'uglify']
    },
    jshint: {
      files: ['Gruntfile.js', 'server.js', 'app/**/*.js', '!app/public/dist/**/*.js', 'test/**/*.js']
    },
    clean: {
      dist: ['dist']
    },
    copy: {
      components: {
        files: [
          {
            expand: true,
            cwd: 'app/public',
            src: ['**/*.html'],
            dest: 'dist/'
          }
        ]
      },
      images: {
        files: [
          {
            expand: true,
            cwd: 'app/public/img',
            src: ['**/*'],
            dest: 'dist/img/'
          }
        ]
      },
      libraries: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: 'bower_components/bootstrap/dist',
            src: ['fonts/*.*'],
            dest: 'dist/'
          },
          {
            expand: true,
            cwd: 'bower_components/components-font-awesome/fonts/',
            src: ['**/*'],
            dest: 'dist/fonts/'
          }
        ]
      }
    },
    concat: {
      nuCubingJs: {
        src: [
          'app/public/app.js',
          'app/public/components/shared/filters/orderObjectBy.js',
          'app/public/components/shared/services/events.js',
          'app/public/components/shared/services/calculator.js',
          'app/public/controller.js',
          'app/public/components/profile/controller.js',
          'app/public/components/users/controller.js',
          'app/public/components/contest/controller.js',
          'app/public/components/contestEntry/controller.js',
          'app/public/components/contestTimer/controller.js',
          'app/public/components/contestFmc/controller.js',
          'app/public/components/contestMbld/controller.js',
          'app/public/components/results/controller.js',
          'app/public/components/admin/controller.js'
        ],
        dest: 'dist/js/nuCubing.js'
      },
      libJs: {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/jquery-ui/jquery-ui.min.js',
          'bower_components/bootstrap/dist/js/bootstrap.min.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/angular-resource/angular-resource.min.js',
          'bower_components/angular-file-upload/dist/angular-file-upload.min.js'
        ],
        dest: 'dist/js/lib.min.js'
      },
      nuCubingCss: {
        src: [
          'app/public/css/style.css'
        ],
        dest: 'dist/css/nuCubing.css'

      },
      libCss: {
        src: [
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
          'bower_components/components-font-awesome/css/font-awesome.min.css'
        ],
        dest: 'dist/css/lib.css'
      }
    },
    uglify: {
      my_target: {
        files: {
          'dist/js/nuCubing.min.js': ['dist/js/nuCubing.js']
        }
      }
    },
    karma: {
      unit: {
        options: {
          frameworks: ['jasmine'],
          singleRun: true,
          browsers: ['PhantomJS'],
          files: [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/jquery-ui/jquery-ui.min.js',
            'bower_components/bootstrap/dist/js/bootstrap.min.js',
            'bower_components/angular/angular.min.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'bower_components/angular-route/angular-route.min.js',
            'bower_components/angular-resource/angular-resource.min.js',
            'bower_components/angular-file-upload/dist/angular-file-upload.min.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'app/public/**/*.js',
            'test/spec/client/**/*.spec.js'
          ]
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'karma', 'clean', 'copy', 'concat', 'uglify', 'watch']);
  grunt.registerTask('prod', ['clean', 'copy', 'concat', 'uglify']);

};