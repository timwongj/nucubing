(function() {

  'use strict';

  function touchEnd() {

    return function(scope, element, attr) {

      element.on('touchend', function(event) {
        scope.$apply(function() {
          scope.$eval(attr.touchEnd);
        });
      });
    };

  }

  angular.module('nuCubingApp').directive('touchEnd', touchEnd);

})();