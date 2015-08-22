(function() {

  'use strict';

  describe('nuCubingApp.Calculator', function() {

    var Calculator;

    beforeEach(module('nuCubingApp'));
    beforeEach(inject(function($injector) {
      Calculator = $injector.get('Calculator');
    }));

    describe('convertResults', function() {

      it('should return an empty array given an empty array', function() {
        var results = [];
        var convertedResults = Calculator.convertResults(results);
        expect(results).toEqual(convertedResults);
      });

    });

    describe('compareResults', function() {

      it ('should return an empty string given two DNFs', function() {
        var res1 = 'DNF', res2 = 'DNF';
        var result = Calculator.compareResults(res1, res2);
        expect(result).toEqual('');
      });

    });

    describe('calculateSingle', function() {

      it ('should return a 6.25', function() {
        var times = ['6.25', '6.25', '6.25', '6.25', '6.25'];
        var penalties = ['', '', '', '', ''];
        var single = Calculator.calculateSingle(times, penalties);
        expect(single).toEqual('6.25');
      });

    });

    describe('calculateAverage', function() {

      it ('should return a 6.25', function() {
        var times = ['6.25', '6.25', '6.25', '6.25', '6.25'];
        var penalties = ['', '', '', '', ''];
        var average = Calculator.calculateAverage(times, penalties);
        expect(average).toEqual('6.25');
      });

    });

    describe('calculateFMCMean', function() {

      it ('should return my nats fmc mean', function() {
        var moves = [23, 42, 33];
        var mean = Calculator.calculateFMCMean(moves);
        expect(mean).toEqual('32.67');
      });

    });

    describe('calculateMean', function() {

      it ('should return a 6.25', function() {
        var times = ['6.25', '6.25', '6.25'];
        var penalties = ['', '', ''];
        var mean = Calculator.calculateMean(times, penalties);
        expect(mean).toEqual('6.25');
      });

    });

    describe('formatTimes', function() {

      it ('should return a 6.25', function() {
        var times = ['6.25', '6.25', '6.25'];
        var penalties = ['', '', ''];
        var formattedTimes = Calculator.formatTimes(times, penalties);
        expect(formattedTimes).toEqual([6.25, 6.25, 6.25]);
      });

    });

    describe('reformatTime', function() {

      it ('should return a 1:09.69', function() {
        var time = '69.69';
        var reformattedTime = Calculator.reformatTime(time);
        expect(reformattedTime).toEqual('1:09.69');
      });

    });

  });

})();
