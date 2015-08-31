(function() {

  'use strict';

  describe('nuCubingApp.Cub', function() {

    var Cub;

    beforeEach(module('nuCubingApp'));
    beforeEach(inject(function($injector) {
      Cub = $injector.get('Cub');
    }));

    describe('constructor', function() {

      it('should create a new cub that is solved', function() {
        var cub = new Cub();
        expect(cub.isSolved()).toEqual(true);
      });

    });

  });

})();
