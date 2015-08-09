(function() {

    'use strict';

    function ResultsController($scope, $http) {

        // get authorization status
        $scope.authStatus = '';
        $http.get('/authStatus').success(function(response) {
            if (response.status == 'connected')
                $scope.authStatus = 'Logout';
            else
                $scope.authStatus = 'Login';
        });

        // events list
        $scope.eventMap = {'x3Cube' : {name : 'Rubik\'s Cube', format: 'avg5', results : [], index: 0},
            'x4Cube' : {name: '4x4 Cube', format: 'avg5', results : [], index: 1},
            'x5Cube' : {name: '5x5 Cube', format: 'avg5', results : [], index: 2},
            'x2Cube' : {name: '2x2 Cube', format: 'avg5', results : [], index: 3},
            'x3BLD' : {name: '3x3 blindfolded', format: 'bo3', results : [], index: 4},
            'x3OH' : {name: '3x3 one-handed', format: 'avg5', results : [], index: 5},
            'x3FMC' : {name: '3x3 fewest moves', format: 'fmc', results : [], index: 6},
            'x3FT' : {name: '3x3 with feet', format: 'mo3', results : [], index: 7},
            'mega' : {name: 'Megaminx', format: 'avg5', results : [], index: 8},
            'pyra' : {name: 'Pyraminx', format: 'avg5', results : [], index: 9},
            'sq1' : {name: 'Square-1', format: 'avg5', results : [], index: 10},
            'clock' : {name: 'Rubik\'s Clock', format: 'avg5', results : [], index: 11},
            'skewb' : {name: 'Skewb', format: 'avg5', results : [], index: 12},
            'x6Cube' : {name: '6x6 Cube', format: 'mo3', results : [], index: 13},
            'x7Cube' : {name: '7x7 Cube', format: 'mo3', results : [], index: 14},
            'x4BLD' : {name: '4x4 blindfolded', format: 'bo3', results : [], index: 15},
            'x5BLD' : {name: '5x5 blindfolded', format: 'bo3', results : [], index: 16},
            'x3MBLD' : {name: '3x3 multi blind', format: 'mbld', results : [], index: 17}
        };

        // get all contest results for all events for the current week
        $http.get('/contest/currentWeek').success(function(currentWeek) {
            $http.get('/results/' + currentWeek).success(function(results) {
                for (var i = 0; i < results.length; i++) {
                    var result = {'name': results[i].firstName + ' ' + results[i].lastName, 'id': results[i].facebook_id};
                    var data = JSON.parse(results[i].data);
                    switch($scope.eventMap[results[i].event].format) {
                        case 'avg5': result.result = calculateAverage(data.times, data.penalties); break;
                        case 'mo3' : result.result = calculateMean(data.times, data.penalties); break;
                        case 'bo3' : result.result = calculateSingle(data.times, data.penalties); break;
                        case 'fmc' : result.result = calculateMean(data.moves, 'FMC'); break;
                        case 'mbld' : result.result = data.solved + '/' + data.attempted + ' in ' + data.time; break;
                    }
                    var details = '';
                    if (results[i].event != 'x3MBLD') {
                        if (results[i].event != 'x3FMC') {
                            for (var j = 0; j < data.times.length; j++) {
                                details += data.times[j] + data.penalties[j];
                                if (j != data.times.length - 1) {
                                    details += ', ';
                                }
                            }
                            if (result.result == 'DNF') {
                                result.raw = 'DNF';
                            } else {
                                var res = result.result.split(':');
                                if (res.length > 1)
                                    result.raw = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
                                else
                                    result.raw = parseFloat(res[0]);
                            }
                        } else {
                            details = data.moves[0] + ', ' + data.moves[1] + ', ' + data.moves[2];
                            result.raw = result.result;
                        }
                    } else {
                        var rawScore = parseFloat(data.solved) - (parseFloat(data.attempted) - parseFloat(data.solved));
                        var rawTime = (parseFloat(data.time.split(':')[0]) * 60) + parseFloat(data.time.split(':')[1]);
                        result.raw = rawScore.toString() + rawTime.toString();
                    }
                    result.details = details;
                    $scope.eventMap[results[i].event].results.push(result);
                }
            });

        });

        $scope.selectedEvent = $scope.eventMap['x3Cube'];

        $scope.selectEvent = function(event) {
            $scope.selectedEvent = event;
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

    angular.module('nuCubingApp').controller('ResultsController', ResultsController);

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
