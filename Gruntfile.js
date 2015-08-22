module.exports = function(grunt) {

  grunt.initConfig({

    jshint: {
      files: ['Gruntfile.js', 'server.js', 'app/**/*.js', '!app/public/dist/**/*.js']
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'copy', 'concat', 'uglify']
    },
    copy: {
      libraries: {
        files: [
          {
            expand: true,
            cwd: 'bower_components/components-font-awesome/fonts/',
            src: ['**/*'],
            dest: 'app/public/dist/fonts/'
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
        dest: 'app/public/dist/js/nuCubing.js'
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
        dest: 'app/public/dist/js/lib.min.js'
      },
      nuCubingCss: {
        src: [
          'app/public/css/style.css'
        ],
        dest: 'app/public/dist/css/nuCubing.css'

      },
      libCss: {
        src: [
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
          'bower_components/components-font-awesome/css/font-awesome.min.css'
        ],
        dest: 'app/public/dist/css/lib.css'
      }
    },
    uglify: {
      my_target: {
        files: {
          'app/public/dist/js/nuCubing.min.js': ['app/public/dist/js/nuCubing.js']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'copy', 'concat', 'uglify', 'watch']);

  grunt.registerTask('dev', ['jshint', 'copy', 'concat', 'uglify', 'watch']);
  grunt.registerTask('prod', ['copy', 'concat', 'uglify']);


};