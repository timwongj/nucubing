(function() {

  'use strict';

  describe('nuCubingApp.Calculator', function() {

    var Calculator;

    beforeEach(module('nuCubingApp'));
    beforeEach(inject(function($injector) {
      Calculator = $injector.get('Calculator');
    }));

    describe('convertResults', function() {

      it('should convert results to displayable format', function() {
        var results = [
          {
            event: '333',
            facebook_id: '1056354001045640',
            firstName: 'Tim',
            lastName: 'Wong',
            status: 'Completed',
            week: '082315',
            data:'{"times":["10.69","11.68","9.48","12.84","6.25"],"penalties":["","","","(DNF)","(+2)"]}'
          }
        ];
        var convertedResults = Calculator.convertResults(results);
        expect(convertedResults[0].average).toEqual('10.62');
        expect(convertedResults[0].best).toEqual('8.25');
        expect(convertedResults[0].details).toEqual('10.69, 11.68, 9.48, DNF, 8.25');
        expect(convertedResults[0].event).toEqual(results[0].event);
        expect(convertedResults[0].week).toEqual(results[0].week);
        expect(convertedResults[0].raw).toEqual(10.62);
        expect(convertedResults[0].index).toEqual(0);
      });

    });

    describe('compareResults', function() {

      it ('should return the faster result', function() {
        var res1 = '6.25', res2 = '6.44';
        var result = Calculator.compareResults(res1, res2);
        expect(result).toEqual('6.25');
      });

      it ('should return the faster result', function() {
        var res1 = '1:09.69', res2 = '4.20';
        var result = Calculator.compareResults(res1, res2);
        expect(result).toEqual('4.20');
      });

    });

    describe('compareMBLDResults', function() {

      it ('should compare two MBLD results by score first', function() {
        var res1 = {solved: '23', attempted: '25', time: '57:39'};
        var res2 = {solved: '22', attempted: '24', time: '28:39'};
        var result = Calculator.compareMBLDResults(res1, res2);
        expect(result).toEqual(res1);
      });

      it ('should compare two MBLD results by time next', function() {
        var res1 = {solved: '23', attempted: '25', time: '57:39'};
        var res2 = {solved: '23', attempted: '25', time: '28:39'};
        var result = Calculator.compareMBLDResults(res1, res2);
        expect(result).toEqual(res2);
      });

      it ('should compare two MBLD results by number attempted last', function() {
        var res1 = {solved: '23', attempted: '25', time: '57:39'};
        var res2 = {solved: '21', attempted: '21', time: '57:39'};
        var result = Calculator.compareMBLDResults(res1, res2);
        expect(result).toEqual(res2);
      });

    });

    describe('calculateFMCSingle', function() {

      it ('should return the best single', function() {
        var moves = [23, 42, 33];
        var single = Calculator.calculateFMCSingle(moves);
        expect(single).toEqual('23');
      });

      it ('should return the best single', function() {
        var moves = ['DNF', 42, 33];
        var single = Calculator.calculateFMCSingle(moves);
        expect(single).toEqual('33');
      });

    });

    describe('calculateSingle', function() {

      it ('should return the fastest single', function() {
        var times = ['6.25', '6.44', '8.48', '7.08', '6.69'];
        var penalties = ['', '', '', '', ''];
        var single = Calculator.calculateSingle(times, penalties);
        expect(single).toEqual('6.25');
      });

      it ('should return the fastest single with penalties taken into account', function() {
        var times = ['6.25', '6.44', '8.48', '7.08', '6.69'];
        var penalties = ['(+2)', '', '', '', ''];
        var single = Calculator.calculateSingle(times, penalties);
        expect(single).toEqual('6.44');
      });

    });

    describe('calculateAverage', function() {

      it ('should calculate the average', function() {
        var times = ['8.23', '9.20', '9.11', '7.61', '10.92'];
        var penalties = ['', '', '', '', ''];
        var average = Calculator.calculateAverage(times, penalties);
        expect(average).toEqual('8.85');
      });

      it ('should calculate the average with counting penalties', function() {
        var times = ['1:23.15', '1:16.19', '1:24.84', '1:27.56', '1:27.65'];
        var penalties = ['(+2)', '', '', '', ''];
        var average = Calculator.calculateAverage(times, penalties);
        expect(average).toEqual('1:25.85');
      });

      it ('should return a DNF if there is more than one DNF', function() {
        var times = ['1:23.15', '1:16.19', '1:24.84', '1:27.56', '1:27.65'];
        var penalties = ['(DNF)', '', '(DNF)', '', ''];
        var average = Calculator.calculateAverage(times, penalties);
        expect(average).toEqual('DNF');
      });

    });

    describe('calculateFMCMean', function() {

      it ('should calculate the fmc mean', function() {
        var moves = [23, 42, 33];
        var mean = Calculator.calculateFMCMean(moves);
        expect(mean).toEqual('32.67');
      });

      it ('should return a DNF if there are any DNFs', function() {
        var moves = [23, 'DNF', 33];
        var mean = Calculator.calculateFMCMean(moves);
        expect(mean).toEqual('DNF');
      });

    });

    describe('calculateMean', function() {

      it ('should calculate the mean', function() {
        var times = ['4.20', '6.25', '6.44'];
        var penalties = ['', '', ''];
        var mean = Calculator.calculateMean(times, penalties);
        expect(mean).toEqual('5.63');
      });

      it ('should calculate the mean with penalties', function() {
        var times = ['3:42.01', '3:45.43', '3:49.90'];
        var penalties = ['(+2)', '', ''];
        var mean = Calculator.calculateMean(times, penalties);
        expect(mean).toEqual('3:46.45');
      });

      it ('should return a DNF if there are any DNFs', function() {
        var times = ['4.20', '6.25', '6.44'];
        var penalties = ['(DNF)', '', ''];
        var mean = Calculator.calculateMean(times, penalties);
        expect(mean).toEqual('DNF');
      });

    });

    describe('formatTimes', function() {

      it ('should return an array of results in milliseconds', function() {
        var times = ['6.25', '6.44', '4:20.69'];
        var penalties = ['', '', ''];
        var formattedTimes = Calculator.formatTimes(times, penalties);
        expect(formattedTimes).toEqual([6.25, 6.44, 260.69]);
      });

      it ('should return an array of results in milliseconds with penalties', function() {
        var times = ['6.25', '6.44', '4:20.69', '1:09.69', '6:25'];
        var penalties = ['(+2)', '', '', '', '(DNF)'];
        var formattedTimes = Calculator.formatTimes(times, penalties);
        expect(formattedTimes).toEqual([8.25, 6.44, 260.69, 69.69, 'DNF']);
      });

    });

    describe('reformatTime', function() {

      it ('should pad the result to digits after the decimal point', function() {
        var time = '6.2569';
        var reformattedTime = Calculator.reformatTime(time);
        expect(reformattedTime).toEqual('6.25');
      });

      it ('should format the time to mm:ss.ms if it is a minute or longer', function() {
        var time = '69.69';
        var reformattedTime = Calculator.reformatTime(time);
        expect(reformattedTime).toEqual('1:09.69');
      });

      it ('should return a DNF given a non-number', function() {
        var time = 'yuh wuh';
        var reformattedTime = Calculator.reformatTime(time);
        expect(reformattedTime).toEqual('DNF');
      });

    });

  });

})();
