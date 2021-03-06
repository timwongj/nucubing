(function() {

  'use strict';

  module.exports = function(grunt) {

    grunt.config('concat', {
      nuCubingJs: {
        src: [
          'app/public/app.js',
          'app/public/components/shared/directives/touchStart.js',
          'app/public/components/shared/directives/touchEnd.js',
          'app/public/components/shared/filters/orderObjectBy.js',
          'app/public/components/shared/services/events.js',
          'app/public/components/shared/services/calculator.js',
          'app/public/components/shared/services/cub.js',
          'app/public/controller.js',
          'app/public/components/profile/profile.controller.js',
          'app/public/components/users/users.controller.js',
          'app/public/components/contest/contest.controller.js',
          'app/public/components/contestEntry/contestEntry.controller.js',
          'app/public/components/contestTimer/contestTimer.controller.js',
          'app/public/components/contestFmc/contestFmc.controller.js',
          'app/public/components/contestMbld/contestMbld.controller.js',
          'app/public/components/results/results.controller.js',
          'app/public/components/results/resultsModal.controller.js',
          'app/public/components/admin/admin.controller.js'
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
          'bower_components/angular-file-upload/dist/angular-file-upload.min.js',
          'bower_components/moment/min/moment.min.js'
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
    });

    grunt.registerTask('concat', function() {
      grunt.task.run(['concat']);
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

  }

})();