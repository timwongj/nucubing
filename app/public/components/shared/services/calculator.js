(function() {

  'use strict';

  function Calculator(Events) {

    return {

      /**
       * Converts raw results to displayable results
       * @param results
       * @returns {Array}
       */
      convertResults: function(results) {
        var res, formattedTimes, convertedResults = [];
        var calculator = this;
        angular.forEach(results, function(result) {
          var data = JSON.parse(result.data);
          var convertedResult = {
            'name': result.firstName + ' ' + result.lastName,
            'facebook_id': result.facebook_id,
            'week': result.week,
            'event': result.event,
            'index': Events[result.event].index
          };
          switch(Events[result.event].format) {
            case 'avg5':
              convertedResult.best = calculator.calculateSingle(data.times, data.penalties);
              convertedResult.average = calculator.calculateAverage(data.times, data.penalties);
              convertedResult.details = '';
              formattedTimes = calculator.formatTimes(data.times, data.penalties);
              angular.forEach(formattedTimes, function(formattedTime, index) {
                convertedResult.details += (index == data.times.length - 1) ? calculator.reformatTime(formattedTime) : calculator.reformatTime(formattedTime) + ', ';
              });
              res = convertedResult.average.split(':');
              convertedResult.raw = (convertedResult.average == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
              break;
            case 'mo3':
              convertedResult.best = calculator.calculateSingle(data.times, data.penalties);
              convertedResult.average = ((result.event == '555bf') || (result.event == '444bf')) ? '' : calculator.calculateMean(data.times, data.penalties);
              convertedResult.details = '';
              formattedTimes = calculator.formatTimes(data.times, data.penalties);
              angular.forEach(formattedTimes, function(formattedTime, index) {
                convertedResult.details += (index == data.times.length - 1) ? calculator.reformatTime(formattedTime) : calculator.reformatTime(formattedTime) + ', ';
              });
              res = convertedResult.average.split(':');
              convertedResult.raw = (convertedResult.average == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
              break;
            case 'bo3':
              convertedResult.best = calculator.calculateSingle(data.times, data.penalties);
              convertedResult.average = ((result.event == '555bf') || (result.event == '444bf')) ? '' : calculator.calculateMean(data.times, data.penalties);
              convertedResult.details = '';
              formattedTimes = calculator.formatTimes(data.times, data.penalties);
              angular.forEach(formattedTimes, function(formattedTime, index) {
                convertedResult.details += (index == data.times.length - 1) ? calculator.reformatTime(formattedTime) : calculator.reformatTime(formattedTime) + ', ';
              });
              res = convertedResult.best.split(':');
              convertedResult.raw = (convertedResult.best == 'DNF') ? 'DNF' : ((res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]));
              break;
            case 'fmc':
              convertedResult.best = calculator.calculateFMCSingle(data.moves);
              convertedResult.average = calculator.calculateFMCMean(data.moves);
              convertedResult.details = data.moves[0] + ', ' + data.moves[1] + ', ' + data.moves[2];
              convertedResult.raw = convertedResult.average;
              break;
            case 'mbld':
              if (data.dnf == '(DNF)') {
                convertedResult.best = 'DNF';
                convertedResult.details = 'DNF';
              } else {
                convertedResult.best = data.solved + '/' + data.attempted + ' in ' + data.time;
                convertedResult.details = convertedResult.best;
              }
              var rawScore = parseFloat(data.solved) - (parseFloat(data.attempted) - parseFloat(data.solved));
              var rawTime = (parseFloat(data.time.split(':')[0]) * 60) + parseFloat(data.time.split(':')[1]);
              convertedResult.raw = rawScore.toString() + rawTime.toString();
              break;
          }
          convertedResults.push(convertedResult);
        });
        return convertedResults;
      },

      /**
       * Compares two results
       * @param res1
       * @param res2
       * @returns {*}
       */
      compareResults: function(res1, res2) {
        if (!res1) {
          return res2;
        } else if (res1 == 'DNF') {
          return (res2 == 'DNF') ? '' : res2;
        } else if (res2 == 'DNF') {
          return res1;
        } else {
          var res1Arr = res1.toString().split(':'), res2Arr = res2.toString().split(':'), res1Formatted, res2Formatted;
          res1Formatted = (res1Arr.length > 1) ? (parseFloat(res1Arr[0]) * 60) + parseFloat(res1Arr[1]) : parseFloat(res1Arr[0]);
          res2Formatted = (res2Arr.length > 2) ? (parseFloat(res2Arr[0]) * 60) + parseFloat(res2Arr[2]) : parseFloat(res2Arr[0]);
          return (res1Formatted > res2Formatted) ? res2 : res1;
        }
      },

      /**
       * Compares two MBLD results
       * @param res1
       * @param res2
       * @returns {*}
       */
      compareMBLDResults: function(res1, res2) {
        if (!res1) {
          return res2;
        }
        var score1 = res1.solved - (res1.attempted - res1.solved), score2 = res2.solved - (res2.attempted - res2.solved);
        if (score1 > score2) {
          return res1;
        } else if (score1 < score2) {
          return res2;
        } else if (res1.time < res2.time) {
          return res1;
        } else if (res1.time > res2.time) {
          return res2;
        } else if (res1.attempted < res2.attempted) {
          return res1;
        } else {
          return res2;
        }
      },

      /**
       * Calculates FMC Single
       * @param moves
       * @returns {string}
       */
      calculateFMCSingle: function(moves) {
        var i, single = 'DNF';
        for (i = 0; i < moves.length; i++) {
          if (moves[i] != 'DNF') {
            if (single == 'DNF') {
              single = moves[i];
            }
            if (parseFloat(moves[i]) < single) {
              single = moves[i];
            }
          }
        }
        return single;
      },

      /**
       * Calculates the best single time
       * @param times
       * @param penalties
       * @returns {*}
       */
      calculateSingle: function(times, penalties) {
        var i, single = 'DNF', formattedTimes = this.formatTimes(times, penalties);
        for (i = 0; i < formattedTimes.length; i++) {
          if (formattedTimes[i] != 'DNF') {
            if (single == 'DNF') {
              single = formattedTimes[i];
            } else if (parseFloat(formattedTimes[i]) < single) {
              single = formattedTimes[i];
            }
          }
        }
        if (single == 'DNF') {
          return single;
        } else {
          return this.reformatTime(single);
        }
      },

      /**
       * Calculate the trimmed average of 5 given the array of times and penalties
       * @param times
       * @param penalties
       * @returns {*}
       */
      calculateAverage: function(times, penalties) {
        var formattedTimes = this.formatTimes(times, penalties);
        var i, DNFCount = 0, minIndex, maxIndex, minValue, maxValue;
        for (i = 0; i < formattedTimes.length; i++) {
          if (formattedTimes[i] == 'DNF') {
            DNFCount++;
          }
        }
        if (DNFCount > 1) {
          return 'DNF';
        }
        if (formattedTimes[0] != 'DNF') {
          minIndex = 0;
          maxIndex = 0;
          minValue = parseFloat(formattedTimes[0]);
          maxValue = parseFloat(formattedTimes[0]);
        } else {
          minIndex = 1;
          maxIndex = 1;
          minValue = parseFloat(formattedTimes[1]);
          maxValue = parseFloat(formattedTimes[1]);
        }
        for (i = 0; i < formattedTimes.length; i++) {
          if (formattedTimes[i] == 'DNF') {
            maxValue = formattedTimes[i];
            maxIndex = i;
            break;
          }
          if (parseFloat(formattedTimes[i]) > maxValue) {
            maxValue = parseFloat(formattedTimes[i]);
            maxIndex = i;
          }
        }
        for (i = 0; i < formattedTimes.length; i++) {
          if ((i != maxIndex) && (parseFloat(formattedTimes[i]) < minValue)) {
            minValue = parseFloat(formattedTimes[i]);
            minIndex = i;
          }
        }
        if ((minIndex === 0) && (maxIndex === 0)) {
          maxIndex = 1;
        }
        var sum = 0;
        for (i = 0; i < formattedTimes.length; i++) {
          if ((i != minIndex) && (i != maxIndex)) {
            sum += parseFloat(formattedTimes[i]);
          }
        }
        var average = sum / (formattedTimes.length - 2);
        return this.reformatTime(average);
      },

      /**
       * Calculate FMC mean of 3
       * @param moves
       * @returns {string}
       */
      calculateFMCMean: function(moves) {
        return ((moves[0] + moves[1] + moves[2]) / 3).toFixed(2);
      },

      /**
       * Calculate the mean of 3 given the array of times and penalties
       * @param times
       * @param penalties
       * @returns {*}
       */
      calculateMean: function(times, penalties) {
        var formattedTimes = this.formatTimes(times, penalties);
        var i, DNFCount = 0;
        for (i = 0; i < formattedTimes.length; i++) {
          if (formattedTimes[i] == 'DNF') {
            DNFCount++;
          }
        }
        if (DNFCount > 0) {
          return 'DNF';
        }
        var sum = 0;
        for (i = 0; i < formattedTimes.length; i++) {
          sum += parseFloat(formattedTimes[i]);
        }
        var mean = sum / formattedTimes.length;
        return this.reformatTime(mean);
      },

      /**
       * return an array of results in milliseconds taking penalties into account
       * @param times
       * @param penalties
       * @returns {Array}
       */
      formatTimes: function(times, penalties) {
        var formattedTimes = [];
        var i, unsplitTimes = [];
        for (i = 0; i < times.length; i++) {
          var res = times[i].split(':');
          if (res.length > 1) {
            unsplitTimes[i] = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
          } else {
            unsplitTimes[i] = parseFloat(res[0]);
          }
          if ((penalties[i] == '(DNF)') || (unsplitTimes[i] === '')) {
            formattedTimes[i] = 'DNF';
          } else if (penalties[i] == '(+2)') {
            formattedTimes[i] = parseFloat(unsplitTimes[i]) + 2;
          } else {
            formattedTimes[i] = unsplitTimes[i];
          }
        }
        return formattedTimes;
      },

      /**
       * Converts the time from milliseconds to minutes:seconds.milliseconds
       * @param time
       * @returns {*}
       */
      reformatTime: function(time) {
        if (isNaN(time)) {
          return 'DNF';
        }
        if (parseFloat(time) <  60) {
          return parseFloat(time).toFixed(2);
        } else {
          var min = Math.floor(parseFloat(time) / 60);
          var sec = (parseFloat(time) % 60).toFixed(2);
          if (sec < 10) {
            return min + ':0' + sec;
          } else {
            return min + ':' + sec;
          }
        }
      }

    };

  }

  angular.module('nuCubingApp').factory('Calculator', ['Events', Calculator]);

})();
