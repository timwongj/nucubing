var app = angular.module('nuCubingApp', ['ui.bootstrap']);

app.controller('profileController', function($scope, $http) {

    $scope.authStatus = '';

    $http.get('/authStatus').success(function(response) {
        if (response.status == 'connected')
            $scope.authStatus = 'Logout';
        else
            $scope.authStatus = 'Login';
    });

    $scope.user = {};

    $http.get('/userInfo').success(function(response) {
        $scope.user.firstName = response.firstName;
        $scope.user.lastName = response.lastName;
        $scope.user.email = response.email;
        $scope.user.wcaID = response.wcaID;
        $scope.user.id = response.facebook_id;
    });

    $scope.personalResults = [];
    $scope.personalResults[0] = {type:'Current Week Results'};
    $scope.personalResults[1] = {type:'Contest Personal Records'};
    $scope.personalResults[2] = {type:'Unofficial Personal Records'};
    $scope.personalResults[3] = {type:'Official Personal Records'};

    for (var i = 0; i < 4; i++)
        $scope.personalResults[i].results = [];

    $http.get('/contest/results/current').success(function(response) {
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
        }
    });

    $http.get('/contest/results/all').success(function(response) {
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
        }
    });

});

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

function calculateSingle(times, penalties) {
    var single = 'DNF';
    var formattedTimes = formatTimes(times, penalties);
    for (var i = 0; i < formattedTimes.length; i++) {
        if (formattedTimes[i] != 'DNF') {
            if (single == 'DNF')
                single = formattedTimes[i];
            if (parseFloat(formattedTimes[i]) < single)
                single = formattedTimes[i];
        }
    }
    if (single == 'DNF')
        return single
    else {
        return reformatTime(single);
    }

}

function calculateAverage(times, penalties) {
    var formattedTimes = formatTimes(times, penalties);
    var DNFCount = 0;
    for (var i = 0; i < formattedTimes.length; i++) {
        if (formattedTimes[i] == 'DNF')
            DNFCount++;
    }
    if (DNFCount > 1)
        return 'DNF';
    if (formattedTimes[0] != 'DNF') {
        var minIndex = 0, maxIndex = 0;
        var minValue = parseFloat(formattedTimes[0]), maxValue = parseFloat(formattedTimes[0]);
    } else {
        var minIndex = 1, maxIndex = 1;
        var minValue = parseFloat(formattedTimes[1]), maxValue = parseFloat(formattedTimes[1]);
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
    if ((minIndex == 0) && (maxIndex == 0))
        maxIndex = 1;
    var sum = 0;
    for (var i = 0; i < formattedTimes.length; i++)
        if ((i != minIndex) && (i != maxIndex))
            sum += parseFloat(formattedTimes[i]);
    var average = sum / (formattedTimes.length - 2);
    return reformatTime(average);
}

function calculateMean(times, penalties) {
    var formattedTimes = formatTimes(times, penalties);
    var DNFCount = 0;
    for (var i = 0; i < formattedTimes.length; i++) {
        if (formattedTimes[i] == 'DNF')
            DNFCount++;
    }
    if (DNFCount > 0)
        return 'DNF';
    var sum = 0;
    for (var i = 0; i < formattedTimes.length; i++)
        sum += parseFloat(formattedTimes[i]);
    var mean = sum / formattedTimes.length;
    return reformatTime(mean);
}

function formatTimes(times, penalties) {
    var formattedTimes = [];
    var unsplitTimes = [];
    for (var i = 0; i < times.length; i++) {
        var res = times[i].split(':');
        if (res.length > 1)
            unsplitTimes[i] = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
        else
            unsplitTimes[i] = parseFloat(res[0]);
        if ((penalties[i] == '(DNF)') || (unsplitTimes[i] == ''))
            formattedTimes[i] = 'DNF';
        else if (penalties[i] == '(+2)')
            formattedTimes[i] = parseFloat(unsplitTimes[i]) + 2;
        else
            formattedTimes[i] = unsplitTimes[i];
    }
    return formattedTimes;
}

function reformatTime(time) {
    if (parseFloat(time) <  60)
        return parseFloat(time).toFixed(2);
    else {
        var min = Math.floor(parseFloat(time) / 60);
        var sec = (parseFloat(time) % 60).toFixed(2);
        if (sec < 10)
            return min + ':0' + sec;
        else
            return min + ':' + sec;
    }
}

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

