(function() {

    'use strict';

    function ContestTimerController($scope, $http, $location, $interval) {

        // get authorization status
        $scope.authStatus = '';
        $http.get('/auth/status').success(function(response) {
            if (response.status == 'connected')
                $scope.authStatus = 'Logout';
            else
                $scope.authStatus = 'Login';
        });

        $scope.eventMap = {
            '333' : {name: 'Rubik\'s Cube', format: 'avg5', result : ' ', index: 0},
            '444' : {name: '4x4 Cube', format: 'avg5', result : ' ', index: 1},
            '555' : {name: '5x5 Cube', format: 'avg5', result : ' ', index: 2},
            '222' : {name: '2x2 Cube', format: 'avg5', result : ' ', index: 3},
            '333bf' : {name: '3x3 blindfolded', format: 'bo3', result : ' ', index: 4},
            '333oh' : {name: '3x3 one-handed', format: 'avg5', result : ' ', index: 5},
            '333fm' : {name: '3x3 fewest moves', format: 'fmc', result : ' ', index: 6},
            '333ft' : {name: '3x3 with feet', format: 'mo3', result : ' ', index: 7},
            'minx' : {name: 'Megaminx', format: 'avg5', result : ' ', index: 8},
            'pyram' : {name: 'Pyraminx', format: 'avg5', result : ' ', index: 9},
            'sq1' : {name: 'Square-1', format: 'avg5', result : ' ', index: 10},
            'clock' : {name: 'Rubik\'s Clock', format: 'avg5', result : ' ', index: 11},
            'skewb' : {name: 'Skewb', format: 'avg5', result : ' ', index: 12},
            '666' : {name: '6x6 Cube', format: 'mo3', result : ' ', index: 13},
            '777' : {name: '7x7 Cube', format: 'mo3', result : ' ', index: 14},
            '444bf' : {name: '4x4 blindfolded', format: 'bo3', result : ' ', index: 15},
            '555bf' : {name: '5x5 blindfolded', format: 'bo3', result : ' ', index: 16},
            '333mbf' : {name: '3x3 multi blind', format: 'mbld', result : ' ', index: 17}
        };

        $scope.event = '';
        $scope.index = 0;
        $scope.solves = [];
        $scope.result = '';
        $scope.eventFormat = '';
        $scope.done = false;

        var url = $location.$$absUrl.split('/');
        try {
            $scope.eventId = url[url.indexOf('contest') + 1];
            $scope.event = $scope.eventMap[$scope.eventId].name;
        } catch(e) {
            $scope.event = 'Invalid Event';
        }

        // get scrambles
        $http.get('/contest/scrambles/' + $scope.eventId).success(function(response) {
            for (var i = 0; i < response[0].scrambles.length; i++)
            {
                $scope.solves[i] = {};
                $scope.solves[i].result = '';
                $scope.solves[i].penalty = '';
                $scope.solves[i].displayedResult = '';
                $scope.solves[i].completed = false;
                $scope.solves[i].scramble = response[0].scrambles[i];
            }
            $scope.scramble = $scope.solves[$scope.index].scramble;
        });

        // timer
        $scope.now = 0;
        $scope.time = 0;
        $scope.timer_display = '0.00';
        $scope.timerDelay = 10;
        $scope.interval = null;

        $scope.isTiming = 0;
        $scope.isKeydown = 0;

        $scope.keydown = function(event) {
            if ((event.which === 32) && ($scope.isKeydown === 0) && (!$scope.done)) {
                $scope.isKeydown = 1;
                if ($scope.isTiming === 0) {
                    $scope.timer_display = '0.00';
                    $scope.timerStyle = {'color':'#33CC00'};
                } else if ($scope.isTiming === 1) {
                    $scope.stopTimer();
                    $scope.solves[$scope.index].result = reformatTime($scope.time / 1000);
                    $scope.solves[$scope.index].displayedResult = $scope.solves[$scope.index].result;
                    $scope.solves[$scope.index].completed = true;
                    if ($scope.index < $scope.solves.length - 1) {
                        $scope.index++;
                        $scope.scramble = $scope.solves[$scope.index].scramble;
                    } else {
                        $scope.done = true;
                        var times = [], penalties = [];
                        for (var i = 0; i < $scope.solves.length; i++) {
                            times[i] = $scope.solves[i].result;
                            penalties[i] = $scope.solves[i].penalty;
                        }
                        switch($scope.eventMap[$scope.eventId].format) {
                            case 'avg5': $scope.result = calculateAverage(times, penalties); $scope.eventFormat = 'Average of 5'; break;
                            case 'mo3' : $scope.result = calculateMean(times, penalties); $scope.eventFormat = 'Mean of 3'; break;
                            case 'bo3' : $scope.result = calculateSingle(times, penalties); $scope.eventFormat = 'Best of 3'; break;
                        }
                    }
                    $scope.now = 0;
                    $scope.time = 0;
                    $scope.interval = null;
                }
            }
        };

        $scope.keyup = function(event) {
            if ((event.which === 32) && ($scope.isKeydown === 1) && (!$scope.done)) {
                $scope.isKeydown = 0;
                if ($scope.isTiming === 0) {
                    $scope.isTiming = 1;
                    $scope.timerStyle = {'color': 'black'};
                    $scope.startTimer();
                } else if ($scope.isTiming === 1) {
                    $scope.isTiming = 0;
                }
            }
        };

        $scope.startTimer = function() {
            $scope.now = Date.now();

            $scope.interval = $interval(function() {
                var tmp = Date.now();
                var offset = tmp - $scope.now;
                $scope.time += (offset);
                $scope.timer_display = reformatTime($scope.time / 1000);
                $scope.now = tmp;
            }, $scope.timerDelay);
        };

        $scope.stopTimer = function() {
            $interval.cancel($scope.interval);
        };

        $scope.updateResultWithPenalty = function(solve, penalty) {
            solve.penalty = penalty;
            solve.displayedResult = solve.result + ' ' + penalty;
        };

        $scope.submit = function() {
            console.log($scope.solves);
            var result = {'event':$scope.eventId, 'data':{}};
            result.data.times = [];
            result.data.penalties = [];
            for (var i = 0; i < $scope.solves.length; i++) {
                result.data.times[i] = $scope.solves[i].result;
                result.data.penalties[i] = $scope.solves[i].penalty;
            }
            result.data = JSON.stringify(result.data);
            $http.post('/contest/submit', result).success(function(response) {
                window.history.back();
            });
        }

    }

    angular.module('nuCubingApp', ['ui.bootstrap']);

    angular.module('nuCubingApp').controller('ContestTimerController', ContestTimerController);

})();

// calculate best result from a list of results
function findBest(results) {
    var best = 'DNF';
    var unsplitTimes = [];
    for (var i = 0; i < results.length; i++) {
        var res = results[i].split(':');
        if (res.length > 1)
            unsplitTimes[i] = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
        else
            unsplitTimes[i] = parseFloat(res[0]);
    }
    for (var i = 0; i < results.length; i++) {
        if ((best == 'DNF') && (unsplitTimes[i] != 'DNF'))
            best = unsplitTimes[i];
        if (parseFloat(unsplitTimes[i]) < best)
            best = unsplitTimes[i];
    }
    return reformatTime(best);
}

// calculate the best single time from a single week
function calculateSingle(times, penalties) {
    var single = 'DNF', formattedTimes = formatTimes(times, penalties);
    for (var i = 0; i < formattedTimes.length; i++) {
        if (formattedTimes[i] != 'DNF') {
            if (single == 'DNF')
                single = formattedTimes[i];
            if (parseFloat(formattedTimes[i]) < single)
                single = formattedTimes[i];
        }
    }
    if (single == 'DNF') {
        return single;
    } else {
        return reformatTime(single);
    }
}

// calculate the trimmed average of 5 given the array of times and penalties
function calculateAverage(times, penalties) {
    var formattedTimes = formatTimes(times, penalties);
    var DNFCount = 0, minIndex, maxIndex, minValue, maxValue;
    for (var i = 0; i < formattedTimes.length; i++) {
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
    for (var i = 0; i < formattedTimes.length; i++) {
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
    for (var i = 0; i < formattedTimes.length; i++) {
        if ((i != maxIndex) && (parseFloat(formattedTimes[i]) < minValue)) {
            minValue = parseFloat(formattedTimes[i]);
            minIndex = i;
        }
    }
    if ((minIndex == 0) && (maxIndex == 0)) {
        maxIndex = 1;
    }
    var sum = 0;
    for (var i = 0; i < formattedTimes.length; i++) {
        if ((i != minIndex) && (i != maxIndex)) {
            sum += parseFloat(formattedTimes[i]);
        }
    }
    var average = sum / (formattedTimes.length - 2);
    return reformatTime(average);
}

// calculate FMC mean of 3
function calculateFMCMean(moves) {
    return ((moves[0] + moves[1] + moves[2]) / 3).toFixed(2);
}

// calculate the mean of 3 given the array of times and penalties
function calculateMean(times, penalties) {
    var formattedTimes = formatTimes(times, penalties);
    var DNFCount = 0;
    for (var i = 0; i < formattedTimes.length; i++) {
        if (formattedTimes[i] == 'DNF') {
            DNFCount++;
        }
    }
    if (DNFCount > 0) {
        return 'DNF';
    }
    var sum = 0;
    for (var i = 0; i < formattedTimes.length; i++) {
        sum += parseFloat(formattedTimes[i]);
    }
    var mean = sum / formattedTimes.length;
    return reformatTime(mean);
}

// return an array of results in milliseconds taking penalties into account
function formatTimes(times, penalties) {
    var formattedTimes = [];
    var unsplitTimes = [];
    for (var i = 0; i < times.length; i++) {
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
}

// convert the time from seconds.milliseconds to minutes:seconds.milliseconds
function reformatTime(time) {
    if (isNaN(time)) {
        return 'DNF';
    } else if (parseFloat(time) < 60) {
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

// prevent default behavior of enter key
function stopRKey(evt) {
    var evt = (evt) ? evt : ((event) ? event : null);
    var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
    if ((evt.keyCode == 13) && (node.type=="text"))  {return false;}
}

document.onkeypress = stopRKey;
