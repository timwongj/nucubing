(function() {

  'use strict';

  module.exports = function(grunt) {

    grunt.config('watch', {
      files: ['server.js', 'app/**/*', 'test/**/*', 'config/**/*', 'grunt/**/*', 'Gruntfile.js'],
      tasks: ['jshint', 'copy', 'concat', 'uglify']
    });

    grunt.registerTask('watch', function() {
      grunt.task.run(['watch']);
    });

    grunt.loadNpmTasks('grunt-contrib-watch');

  }

})();