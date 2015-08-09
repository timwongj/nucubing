(function() {

    'use strict';

    function ContestController($scope, $http) {

        // get authorization status
        $scope.authStatus = '';
        $http.get('/authStatus').success(function(response) {
            if (response.status == 'connected')
                $scope.authStatus = 'Logout';
            else
                $scope.authStatus = 'Login';
        });

        // variables for ng-show
        $scope.showHome = 1;
        $scope.showManualEntry = 0;
        $scope.showFMC = 0;
        $scope.showMBLD = 0;

        // events list
        $scope.eventMap = {'x3Cube' : {name : 'Rubik\'s Cube', format: 'avg5', result : ' ', index: 0},
            'x4Cube' : {name: '4x4 Cube', format: 'avg5', result : ' ', index: 1},
            'x5Cube' : {name: '5x5 Cube', format: 'avg5', result : ' ', index: 2},
            'x2Cube' : {name: '2x2 Cube', format: 'avg5', result : ' ', index: 3},
            'x3BLD' : {name: '3x3 blindfolded', format: 'bo3', result : ' ', index: 4},
            'x3OH' : {name: '3x3 one-handed', format: 'avg5', result : ' ', index: 5},
            'x3FMC' : {name: '3x3 fewest moves', format: 'fmc', result : ' ', index: 6},
            'x3FT' : {name: '3x3 with feet', format: 'mo3', result : ' ', index: 7},
            'mega' : {name: 'Megaminx', format: 'avg5', result : ' ', index: 8},
            'pyra' : {name: 'Pyraminx', format: 'avg5', result : ' ', index: 9},
            'sq1' : {name: 'Square-1', format: 'avg5', result : ' ', index: 10},
            'clock' : {name: 'Rubik\'s Clock', format: 'avg5', result : ' ', index: 11},
            'skewb' : {name: 'Skewb', format: 'avg5', result : ' ', index: 12},
            'x6Cube' : {name: '6x6 Cube', format: 'mo3', result : ' ', index: 13},
            'x7Cube' : {name: '7x7 Cube', format: 'mo3', result : ' ', index: 14},
            'x4BLD' : {name: '4x4 blindfolded', format: 'bo3', result : ' ', index: 15},
            'x5BLD' : {name: '5x5 blindfolded', format: 'bo3', result : ' ', index: 16},
            'x3MBLD' : {name: '3x3 multi blind', format: 'mbld', result : ' ', index: 17}
        };

        // get current week contest results for user
        $http.get('/contest/results/current').success(function(response) {
            var results = response;
            if (results) {
                for (var i = 0; i < results.length; i++) {
                    var data = JSON.parse(results[i].data);
                    switch($scope.eventMap[results[i].event].format) {
                        case 'avg5': $scope.eventMap[results[i].event].result = calculateAverage(data.times, data.penalties); break;
                        case 'mo3' : $scope.eventMap[results[i].event].result = calculateMean(data.times, data.penalties); break;
                        case 'bo3' : $scope.eventMap[results[i].event].result = calculateSingle(data.times, data.penalties); break;
                        case 'fmc' : $scope.eventMap[results[i].event].result = calculateMean(data.moves, 'FMC'); break;
                        case 'mbld' : $scope.eventMap[results[i].event].result = data.solved + '/' + data.attempted + ' in ' + data.time; break;
                    }
                }
            }
            for (var event in $scope.eventMap) {
                if ($scope.eventMap.hasOwnProperty(event)) {
                    if ($scope.eventMap[event].result == ' ') {
                        $scope.eventMap[event].result = 'Not Completed';
                    }
                }
            }
        });

        // event variables
        $scope.event;
        $scope.eventId;
        $scope.solves;
        $scope.mbldResult = {'solved':'', 'attempted':'', 'time':''};

        // go to manual entry page for the event
        $scope.manualEntry = function(event) {
            // get event name
            for (var e in $scope.eventMap) {
                if ($scope.eventMap.hasOwnProperty(e)) {
                    if ($scope.eventMap[e].name == event.name) {
                        $scope.eventId = e;
                    }
                }
            }
            // get current week
            $http.get('/contest/currentWeek').success(function(response) {
                $scope.week = response;
                // get scrambles
                $http.get('/contest/' + $scope.week + '/' + $scope.eventId + '/scrambles').success(function(response) {
                    $scope.solves = [];
                    for (var i = 0; i < response.length; i++)
                    {
                        $scope.solves[i] = {};
                        $scope.solves[i].result = '';
                        $scope.solves[i].penalty = '';
                        $scope.solves[i].solution = '';
                        $scope.solves[i].scramble = response[i];
                    }
                });
                // get results if they exist
                $http.get('/contest/results/' + $scope.week + '/' + $scope.eventId).success(function(results) {
                    if (results) {
                        var data = JSON.parse(results.data);
                        switch($scope.eventMap[results.event].format) {
                            case 'avg5' :
                            case 'mo3' :
                            case 'bo3' :
                                for (var i = 0; i < $scope.solves.length; i++) {
                                    $scope.solves[i].result = data.times[i];
                                    $scope.solves[i].penalty = data.penalties[i];
                                }
                                break;
                            case 'fmc' :
                                for (var i = 0; i < $scope.solves.length; i++) {
                                    $scope.solves[i].solution = data.solutions[i];
                                    $scope.solves[i].result = data.moves[i];
                                }
                                break;
                            case 'mbld' :
                                $scope.mbldResult = {'solved':data.solved, 'attempted':data.attempted, 'time':data.time};
                                break;
                        }
                    }
                });
            });
            $scope.event = event.name;
            $scope.showHome = 0;
            if (event.name == '3x3 fewest moves') {
                $scope.showFMC = 1;
            } else if (event.name == '3x3 multi blind') {
                $scope.showMBLD = 1;
            } else {
                $scope.showManualEntry = 1;
            }
        };

        // go back to the contest home page
        $scope.cancel = function() {
            $scope.event = '';
            $scope.showHome = 1;
            $scope.showManualEntry = 0;
            $scope.showFMC = 0;
            $scope.showMBLD = 0;
        };

        $scope.countMoves = function(index) {
            $scope.solves[index].result = $scope.solves[index].solution.split(' ').length;
        };

        // submit results for the given event for the current week
        $scope.submit = function() {
            var results = {'event':$scope.eventId, 'week':$scope.week, 'data':{}};
            if ($scope.eventId == 'x3MBLD') {
                results.data.solved = $scope.mbldResult.solved;
                results.data.attempted = $scope.mbldResult.attempted;
                results.data.time = $scope.mbldResult.time;
            } else if ($scope.eventId == 'x3FMC') {
                results.data.solutions = [];
                results.data.moves = [];
                for (var i = 0; i < $scope.solves.length; i++) {
                    results.data.solutions[i] = $scope.solves[i].solution;
                    results.data.moves[i] = $scope.solves[i].result;
                }
            } else {
                results.data.times = [];
                results.data.penalties = [];
                for (var i = 0; i < $scope.solves.length; i++) {
                    results.data.times[i] = $scope.solves[i].result;
                    results.data.penalties[i] = $scope.solves[i].penalty;
                }
            }
            results.data = JSON.stringify(results.data);
            $http.post('/contest/submit', results).success(function (response) {
                $http.get('/contest/results/current').success(function(results) {
                    if (results) {
                        for (var i = 0; i < results.length; i++) {
                            var data = JSON.parse(results[i].data);
                            switch($scope.eventMap[results[i].event].format) {
                                case 'avg5' : $scope.eventMap[results[i].event].result = calculateAverage(data.times, data.penalties); break;
                                case 'mo3' : $scope.eventMap[results[i].event].result = calculateMean(data.times, data.penalties); break;
                                case 'bo3' : $scope.eventMap[results[i].event].result = calculateSingle(data.times, data.penalties); break;
                                case 'fmc' : $scope.eventMap[results[i].event].result = calculateMean(data.moves, 'FMC'); break;
                                case 'mbld' : $scope.eventMap[results[i].event].result = data.solved + '/' + data.attempted + ' in ' + data.time; break;
                            }
                        }
                    }
                    for (var event in $scope.eventMap) {
                        if ($scope.eventMap.hasOwnProperty(event)) {
                            if ($scope.eventMap[event].result == ' ') {
                                $scope.eventMap[event].result = 'Not Completed';
                            }
                        }
                    }
                });
            });
            $scope.event = '';
            $scope.showHome = 1;
            $scope.showManualEntry = 0;
            $scope.showFMC = 0;
            $scope.showMBLD = 0;
        };

    }

    function OrderObjectByFilter() {

        return function(items, field) {
            var filtered = [];
            angular.forEach(items, function(item) {
                filtered.push(item);
            });
            filtered.sort(function (a, b) {
                return (a[field] > b[field] ? 1 : -1);
            });
            return filtered;
        };

    }

    angular.module('nuCubingApp', ['ui.bootstrap']);

    angular.module('nuCubingApp').filter('orderObjectBy', OrderObjectByFilter);

    angular.module('nuCubingApp').controller('ContestController', ContestController);

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

// calculate the mean of 3 given the array of times and penalties
function calculateMean(times, penalties) {
    if (penalties = 'FMC') {
        return ((times[0] + times[1] + times[2]) / 3).toFixed(2);
    }
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

// convert the time from milliseconds to minutes:seconds.milliseconds
function reformatTime(time) {
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

// prevent default behavior of enter key
function stopRKey(evt) {
    var evt = (evt) ? evt : ((event) ? event : null);
    var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
    if ((evt.keyCode == 13) && (node.type=="text"))  {return false;}
}

document.onkeypress = stopRKey;

// facebook
window.fbAsyncInit = function() {
    FB.init({
        appId: '1397096627278092',
        cookies: true,
        xfbml: true,
        version: 'v2.3'
    });
};

(function(d, s, id){
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {return;}
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
