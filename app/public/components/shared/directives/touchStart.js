(function() {

  'use strict';

  function touchStart() {

    return function(scope, element, attr) {

      element.on('touchstart', function(event) {
        scope.$apply(function() {
          scope.$eval(attr.touchStart);
        });
      });
    };

  }

  angular.module('nuCubingApp').directive('touchStart', touchStart);

})();