(function() {

  'use strict';

  function Calculator(Events) {

    return {

      /**
       * Converts raw results to displayable results
       * @param {[Object]} results
       * @returns {[Object]} convertedResults
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
       * @param {String} res1
       * @param {String} res2
       * @returns {String} result
       */
      compareResults: function(res1, res2) {
        if (!res1) {
          return res2;
        } else if (res1 == 'DNF') {
          return (res2 == 'DNF') ? 'DNF' : res2;
        } else if (res2 == 'DNF') {
          return res1;
        } else {
          var res1Arr = res1.toString().split(':'), res2Arr = res2.toString().split(':'), res1Formatted, res2Formatted;
          res1Formatted = (res1Arr.length > 1) ? (parseFloat(res1Arr[0]) * 60) + parseFloat(res1Arr[1]) : parseFloat(res1Arr[0]);
          res2Formatted = (res2Arr.length > 1) ? (parseFloat(res2Arr[0]) * 60) + parseFloat(res2Arr[1]) : parseFloat(res2Arr[0]);
          return (res1Formatted > res2Formatted) ? res2 : res1;
        }
      },

      /**
       * Compares two MBLD results
       * @param {Object} res1
       * @param {Object} res2
       * @returns {Object} result
       */
      compareMBLDResults: function(res1, res2) {
        if (!res1) {
          return res2;
        }
        var score1 = parseInt(res1.solved) - (parseInt(res1.attempted) - parseInt(res1.solved));
        var score2 = parseInt(res2.solved) - (parseInt(res2.attempted) - parseInt(res2.solved));
        var times = this.formatTimes([res1.time, res2.time],['','']);
        if (score1 > score2) {
          return res1;
        } else if (score1 < score2) {
          return res2;
        } else if (times[0] < times[1]) {
          return res1;
        } else if (times[0] > times[1]) {
          return res2;
        } else if (res1.attempted < res2.attempted) {
          return res1;
        } else {
          return res2;
        }
      },

      /**
       * Calculates the best FMC Single
       * @param {[Number]} moves
       * @returns {string}
       */
      calculateFMCSingle: function(moves) {
        var single = 'DNF';
        angular.forEach(moves, function(move) {
          single = ((single == 'DNF') && (!isNaN(move))) ? move : single;
          single = ((parseFloat(move) < single) && ((move != 'DNF') && (move != 'DNS'))) ? move : single;
        });
        return single.toString();
      },

      /**
       * Calculates the best single time
       * @param {[Number]} times
       * @param {[String]} penalties
       * @returns {string} average
       */
      calculateSingle: function(times, penalties) {
        var single = 'DNF', formattedTimes = this.formatTimes(times, penalties);
        angular.forEach(formattedTimes, function(formattedTime) {
          single = ((formattedTime != 'DNF') && (single == 'DNF')) ? formattedTime : single;
          single = ((formattedTime != 'DNF') && (parseFloat(formattedTime) < single)) ? formattedTime : single;
        });
        return (single == 'DNF') ? 'DNF' : this.reformatTime(single);
      },

      /**
       * Calculate the trimmed average of 5 given the array of times and penalties
       * @param {[]} times
       * @param penalties
       * @returns {*}
       */
      calculateAverage: function(times, penalties) {
        var DNFCount = 0;
        for (var i = 0; i < penalties.length; i++) {
          if (penalties[i] == '(DNF)') {
            DNFCount++;
            if (DNFCount > 1) {
              return 'DNF';
            }
          }
        }
        var formattedTimes = this.formatTimes(times, penalties);
        var minIndex, maxIndex, minValue, maxValue;
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
        angular.forEach(formattedTimes, function(formattedTime, index) {
          if ((index != maxIndex) && (parseFloat(formattedTime) < minValue)) {
            minValue = parseFloat(formattedTime);
            minIndex = index;
          }
        });
        if ((minIndex === 0) && (maxIndex === 0)) {
          maxIndex = 1;
        }
        var sum = 0;
        angular.forEach(formattedTimes, function(formattedTime, index) {
          if ((index != minIndex) && (index != maxIndex)) {
            sum += parseFloat(formattedTime);
          }
        });
        var average = (sum / (formattedTimes.length - 2)).toFixed(2);
        return this.reformatTime(average);
      },

      /**
       * Calculate FMC mean of 3
       * @param {[Number|String]} moves
       * @returns {string} mean
       */
      calculateFMCMean: function(moves) {
        var sum = 0;
        for (var i = 0; i < moves.length; i++) {
          if (isNaN(moves[i])) {
            return 'DNF';
          }
          sum += moves[i];
        }
        return (sum / 3).toFixed(2);
      },

      /**
       * Calculates the mean given the times and penalties
       * @param {[Number]} times
       * @param {[String]} penalties
       * @returns {String} mean
       */
      calculateMean: function(times, penalties) {
        for (var i = 0; i < penalties.length; i++) {
          if (penalties[i] == '(DNF)') {
            return 'DNF';
          }
        }
        var formattedTimes = this.formatTimes(times, penalties);
        var sum = 0;
        angular.forEach(formattedTimes, function(formattedTime) {
          sum += formattedTime;
        });
        var mean = (sum / formattedTimes.length).toFixed(2);
        return this.reformatTime(mean);
      },

      /**
       * Returns an array of results in milliseconds taking penalties into account
       * @param {[Number]} times
       * @param {[String]} penalties
       * @returns {[Number|String]} results
       */
      formatTimes: function(times, penalties) {
        var formattedTimes = [];
        angular.forEach(times, function(time, index) {
          var res = time.split(':');
          formattedTimes[index] = (res.length > 1) ? (parseFloat(res[0]) * 60) + parseFloat(res[1]) : parseFloat(res[0]);
          if ((penalties[index] == '(DNF)') || (formattedTimes[index] === '')) {
            formattedTimes[index] = 'DNF';
          } else if (penalties[index] == '(+2)') {
            formattedTimes[index] = parseFloat(formattedTimes[index]) + 2;
          }
        });
        return formattedTimes;
      },

      /**
       * Reformats the time from milliseconds to mm:ss.ms
       * @param {Number|String} time
       * @returns {String} displayed time
       */
      reformatTime: function(time) {
        if (isNaN(time)) {
          return 'DNF';
        }
        if (parseFloat(time) <  60) {
          return (Math.floor(Number(time) * 100) / 100).toFixed(2).toString();
        } else {
          var min = Math.floor(parseFloat(time) / 60).toString();
          var sec = (Math.floor((Number(time) * 100) % 6000) / 100).toFixed(2).toString();
          return (sec < 10) ? (min + ':0' + sec) : (min + ':' + sec);
        }
      }

    };

  }

  angular.module('nuCubingApp').factory('Calculator', ['Events', Calculator]);

})();
