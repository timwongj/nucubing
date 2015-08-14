(function() {

    'use strict';

    function ProfileController($scope, $http, $location) {

        // get authorization status
        $scope.authStatus = '';
        $http.get('/auth/status').success(function(response) {
            if (response.status == 'connected')
                $scope.authStatus = 'Logout';
            else
                $scope.authStatus = 'Login';
        });

        var url = $location.$$absUrl.split('/');
        var profileId = url[url.indexOf('profile') + 1];

        // get user information
        $scope.user = {};
        $http.get('/profile/userInfo/' + profileId).success(function(response) {
            $scope.user.firstName = response.firstName;
            $scope.user.lastName = response.lastName;
            $scope.user.facebook_id = response.facebook_id;
        });

        // events list
        $scope.eventMap = {
            '333' : {name : 'Rubik\'s Cube', format: 'avg5', index: 0},
            '444' : {name: '4x4 Cube', format: 'avg5', index: 1},
            '555' : {name: '5x5 Cube', format: 'avg5', index: 2},
            '222' : {name: '2x2 Cube', format: 'avg5', index: 3},
            '333bf' : {name: '3x3 blindfolded', format: 'bo3', index: 4},
            '333oh' : {name: '3x3 one-handed', format: 'avg5', index: 5},
            '333fm' : {name: '3x3 fewest moves', format: 'fmc', index: 6},
            '333ft' : {name: '3x3 with feet', format: 'mo3', index: 7},
            'minx' : {name: 'Megaminx', format: 'avg5', index: 8},
            'pyram' : {name: 'Pyraminx', format: 'avg5', index: 9},
            'sq1' : {name: 'Square-1', format: 'avg5', index: 10},
            'clock' : {name: 'Rubik\'s Clock', format: 'avg5', index: 11},
            'skewb' : {name: 'Skewb', format: 'avg5', index: 12},
            '666' : {name: '6x6 Cube', format: 'mo3', index: 13},
            '777' : {name: '7x7 Cube', format: 'mo3', index: 14},
            '444bf' : {name: '4x4 blindfolded', format: 'bo3', index: 15},
            '555bf' : {name: '5x5 blindfolded', format: 'bo3', index: 16},
            '333mbf' : {name: '3x3 multi blind', format: 'mbld', index: 17}
        };

        // list for current week results and overall personal best results
        $scope.personalResults = [];
        $scope.personalResults[0] = {type:'This Week'};
        for (var i = 0; i < $scope.personalResults.length; i++)
            $scope.personalResults[i].results = [];

        // get current week results for user
        $http.get('/profile/results/current/' + profileId).success(function(results) {
            for (var i = 0; i < results.length; i++) {
                $scope.personalResults[0].results[i] = {'event':$scope.eventMap[results[i].event].name, 'index':$scope.eventMap[results[i].event].index};
                var data = JSON.parse(results[i].data);
                switch($scope.eventMap[results[i].event].format) {
                    case 'avg5' :
                        $scope.personalResults[0].results[i].single = calculateSingle(data.times, data.penalties);
                        $scope.personalResults[0].results[i].average = calculateAverage(data.times, data.penalties);
                        break;
                    case 'mo3' :
                    case 'bo3' :
                        $scope.personalResults[0].results[i].single = calculateSingle(data.times, data.penalties);
                        $scope.personalResults[0].results[i].average = calculateMean(data.times, data.penalties);
                        break;
                    case 'fmc' :
                        $scope.personalResults[0].results[i].single = calculateFMCSingle(data.moves);
                        $scope.personalResults[0].results[i].average = calculateFMCMean(data.moves);
                        break;
                    case 'mbld' :
                        $scope.personalResults[0].results[i].single = data.solved + '/' + data.attempted + ' in ' + data.time;
                        break;
                }
            }
        });

        $scope.personalBestsMap = $scope.eventMap;
        $scope.personalBests = [];

        for (var event in $scope.personalBestsMap) {
            if ($scope.personalBestsMap.hasOwnProperty(event)) {
                $scope.personalBestsMap[event].single = '';
                $scope.personalBestsMap[event].average = '';
            }
        }

        // get personal results for user
        $http.get('/profile/results/all/' + profileId).success(function(results) {
            for (var i = 0; i < results.length; i++) {
                var data = JSON.parse(results[i].data);
                switch($scope.personalBestsMap[results[i].event].format) {
                    case 'avg5' :
                        $scope.personalBestsMap[results[i].event].single = compareResults($scope.personalBestsMap[results[i].event].single, calculateSingle(data.times, data.penalties));
                        $scope.personalBestsMap[results[i].event].average = compareResults($scope.personalBestsMap[results[i].event].average, calculateAverage(data.times, data.penalties));
                        break;
                    case 'mo3' :
                    case 'bo3' :
                        $scope.personalBestsMap[results[i].event].single = compareResults($scope.personalBestsMap[results[i].event].single, calculateSingle(data.times, data.penalties));
                        $scope.personalBestsMap[results[i].event].average = compareResults($scope.personalBestsMap[results[i].event].average, calculateMean(data.times, data.penalties));
                        break;
                    case 'fmc' :
                        $scope.personalBestsMap[results[i].event].single = compareResults($scope.personalBestsMap[results[i].event].single, calculateFMCSingle(data.moves));
                        $scope.personalBestsMap[results[i].event].average = compareResults($scope.personalBestsMap[results[i].event].average, calculateFMCMean(data.moves));
                        break;
                    case 'mbld' :
                        var mbldResult = compareMBLDResults($scope.personalBestsMap[results[i].event].single, data);
                        $scope.personalBestsMap[results[i].event].single = mbldResult.solved + '/' + mbldResult.attempted + ' in ' + mbldResult.time;
                        break;
                }
            }
            for (var event in $scope.personalBestsMap) {
                if ($scope.personalBestsMap.hasOwnProperty(event)) {
                    if (($scope.personalBestsMap[event].single) || ($scope.personalBestsMap[event].average)) {
                        $scope.personalBests.push({
                            name: $scope.personalBestsMap[event].name,
                            single: $scope.personalBestsMap[event].single,
                            average: $scope.personalBestsMap[event].average,
                            index: $scope.personalBestsMap[event].index
                        });
                    }
                }
            }
        });

    }

    angular.module('nuCubingApp', ['ui.bootstrap']);

    angular.module('nuCubingApp').controller('ProfileController', ProfileController);

})();

// compare two results
function compareResults(res1, res2) {
    if (!res1) {
        return res2;
    } else if (res1 == 'DNF') {
        if (res2 == 'DNF') {
            return '';
        } else {
            return res2;
        }
    } else if (res2 == 'DNF') {
        return res1;
    } else {
        var res1Arr = res1.split(':'), res2Arr = res2.split(':'), res1Formatted, res2Formatted;
        if (res1Arr.length > 1) {
            res1Formatted = (parseFloat(res1Arr[0]) * 60) + parseFloat(res1Arr[1]);
        } else {
            res1Formatted = parseFloat(res1Arr[0]);
        }
        if (res2Arr.length > 2) {
            res2Formatted = (parseFloat(res2Arr[0]) * 60) + parseFloat(res2Arr[2]);
        } else {
            res2Formatted = parseFloat(res2Arr[0]);
        }
        if (res1Formatted > res2Formatted) {
            return res2;
        } else {
            return res1;
        }
    }
}

function compareMBLDResults(res1, res2) {
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
}

// calculate the best fmc single
function calculateFMCSingle(moves) {
    var single = 'DNF';
    for (var i = 0; i < moves.length; i++) {
        if (moves[i] != 'DNF') {
            if (single == 'DNF')
                single = moves[i];
            if (parseFloat(moves[i]) < single)
                single = moves[i];
        }
    }
    return single;
}

// calculate the best single time
function calculateSingle(times, penalties) {
    var single = 'DNF', formattedTimes = formatTimes(times, penalties);
    for (var i = 0; i < formattedTimes.length; i++) {
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
