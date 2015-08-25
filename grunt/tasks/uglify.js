(function() {

  'use strict';

  module.exports = function(grunt) {

    grunt.config('uglify', {
      my_target: {
        files: {
          'dist/js/nuCubing.min.js': ['dist/js/nuCubing.js']
        }
      }
    });

    grunt.registerTask('uglify', function() {
      grunt.task.run(['uglify']);
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

  }

})();