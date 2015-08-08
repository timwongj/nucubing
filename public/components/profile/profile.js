(function() {

    'use strict';

    function ProfileController($scope, $http, $location) {

        // get authorization status
        $scope.authStatus = '';
        $http.get('/authStatus').success(function(response) {
            if (response.status == 'connected')
                $scope.authStatus = 'Logout';
            else
                $scope.authStatus = 'Login';
        });

        var url = $location.$$absUrl.split('/');
        var profileId = url[url.indexOf('profile') + 1];

        // get user information
        $scope.user = {};
        $http.get('/userInfo/id/' + profileId).success(function(response) {
            $scope.user.firstName = response.firstName;
            $scope.user.lastName = response.lastName;
            $scope.user.email = response.email;
            $scope.user.wcaID = response.wcaID;
            $scope.user.id = response.facebook_id;
        });

        // list for current week results and overall personal best results
        $scope.personalResults = [];
        $scope.personalResults[0] = {type:'Current Week Results'};
        $scope.personalResults[1] = {type:'Contest Personal Records'};
        for (var i = 0; i < $scope.personalResults.length; i++)
            $scope.personalResults[i].results = [];

        // get current week results for user
        $http.get('/contest/results/current/' + profileId).success(function(response) {
            if (response != null) {
                for (var i = 0; i < response.length; i++) {
                    $scope.personalResults[0].results[i] = {};
                    $scope.personalResults[0].results[i].single = calculateSingle(response[i].times, response[i].penalties);
                    if (response[i].times.length == 5)
                        $scope.personalResults[0].results[i].average = calculateAverage(response[i].times, response[i].penalties);
                    else if (response[i].times.length == 3)
                        $scope.personalResults[0].results[i].average = calculateMean(response[i].times, response[i].penalties);
                    if (response[i].event == 'x3Cube')
                        $scope.personalResults[0].results[i].event = "Rubik's Cube";
                    if (response[i].event == 'x4Cube')
                        $scope.personalResults[0].results[i].event = "4x4 Cube";
                    if (response[i].event == 'x5Cube')
                        $scope.personalResults[0].results[i].event = "5x5 Cube";
                    if (response[i].event == 'x2Cube')
                        $scope.personalResults[0].results[i].event = "2x2 Cube";
                    if (response[i].event == 'x3BLD')
                        $scope.personalResults[0].results[i].event = "3x3 Blindfolded";
                    if (response[i].event == 'x3OH')
                        $scope.personalResults[0].results[i].event = "3x3 One-Handed";
                    if (response[i].event == 'pyra')
                        $scope.personalResults[0].results[i].event = "Pyraminx";
                }
                sortByEvent($scope.personalResults[0].results);
            }
        });

        // get personal results for user
        $http.get('/contest/results/all/' + profileId).success(function(response) {
            if (response != null) {
                var events = [];
                for (var i = 0; i < response.length; i++) {
                    if (events.indexOf(response[i].event) == -1)
                        events.push(response[i].event);
                }
                for (var i = 0; i < events.length; i++) {
                    $scope.personalResults[1].results[i] = {};
                    if (events[i] == 'x3Cube')
                        $scope.personalResults[1].results[i].event = "Rubik's Cube";
                    if (events[i] == 'x4Cube')
                        $scope.personalResults[1].results[i].event = "4x4 Cube";
                    if (events[i] == 'x5Cube')
                        $scope.personalResults[1].results[i].event = "5x5 Cube";
                    if (events[i] == 'x2Cube')
                        $scope.personalResults[1].results[i].event = "2x2 Cube";
                    if (events[i] == 'x3BLD')
                        $scope.personalResults[1].results[i].event = "3x3 Blindfolded";
                    if (events[i] == 'x3OH')
                        $scope.personalResults[1].results[i].event = "3x3 One-Handed";
                    if (events[i] == 'pyra')
                        $scope.personalResults[1].results[i].event = "Pyraminx";
                    var singles = [];
                    var averages = [];
                    for (var j = 0; j < response.length; j++) {
                        if (response[j].event == events[i]) {
                            singles.push(calculateSingle(response[j].times, response[j].penalties));
                            if (response[j].times.length == 5)
                                averages.push(calculateAverage(response[j].times, response[j].penalties));
                            else if (response[j].times.length == 3)
                                averages.push(calculateAverage(response[j].times, response[j].penalties));
                        }
                    }
                    $scope.personalResults[1].results[i].single = findBest(singles);
                    $scope.personalResults[1].results[i].average = findBest(averages);
                }
                sortByEvent($scope.personalResults[1].results);
            }
        });

    }

    angular.module('nuCubingApp', ['ui.bootstrap']);

    angular.module('nuCubingApp').controller('ProfileController', ProfileController);

})();

// sort results by event order
function sortByEvent(results) {
    var events = ["Rubik's Cube", "4x4 Cube", "5x5 Cube", "2x2 Cube", "3x3 Blindfolded", "3x3 One-Handed", "Pyraminx"];
    for (var i = 0; i < results.length; i++) {
        for (var j = i; j < results.length; j++) {
            if (events.indexOf(results[i].event) > events.indexOf(results[j].event)) {
                var temp = results[i];
                results[i] = results[j];
                results[j] = temp;
            }
        }
    }
}

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