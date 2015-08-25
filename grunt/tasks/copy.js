(function() {

  'use strict';

  module.exports = function(grunt) {

    grunt.config('copy', {
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
    });

    grunt.registerTask('copy', function() {
      grunt.task.run(['copy']);
    });

    grunt.loadNpmTasks('grunt-contrib-copy');

  }

})();