(function() {

  'use strict';

  module.exports = function(grunt) {

    grunt.config('clean', {
      files: ['dist']
    });

    grunt.registerTask('clean', function() {
      grunt.task.run(['clean']);
    });

    grunt.loadNpmTasks('grunt-contrib-clean');

  }

})();