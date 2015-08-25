(function() {

  'use strict';

  module.exports = function(grunt) {

    grunt.config('jshint', {
      files: ['Gruntfile.js', 'server.js', 'app/**/*.js', '!app/public/dist/**/*.js', 'test/**/*.js']
    });

    grunt.registerTask('jshint', function() {
      grunt.task.run(['jshint']);
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

  }

})();