var app = angular.module('nuCubingApp', ['ui.bootstrap']);

app.controller('contestController', function($scope, $http) {

    $scope.authStatus = '';

    $http.get('/authStatus').success(function(response) {
        if (response.status == 'connected')
            $scope.authStatus = 'Logout';
        else
            $scope.authStatus = 'Login';
    });

    $scope.showHome = 1;
    $scope.showManualEntry = 0;
    $scope.showTimer = 0;

    $scope.events = [];
    $scope.events[0] = {name:"Rubik's Cube", result:'Not Completed'};
    $scope.events[1] = {name:"4x4 Cube", result:'Not Completed'};
    $scope.events[2] = {name:"5x5 Cube", result:'Not Completed'};
    $scope.events[3] = {name:"2x2 Cube", result:'Not Completed'};
    $scope.events[4] = {name:"3x3 Blindfolded", result:'Not Completed'};
    $scope.events[5] = {name:"3x3 One-Handed", result:'Not Completed'};
    $scope.events[6] = {name:"Pyraminx", result:'Not Completed'};

    $http.get('/contest/results').success(function(response) {
        if (response != null) {
            console.log(response);
            for (var i = 0; i < response.length; i++) {
                var result;
                if (response[i].times.length == 5)
                    result = calculateAverage(response[i].times, response[i].penalties);
                else if (response[i].times.length == 3)
                    result = calculateMean(response[i].times, response[i].penalties);
                if (response[i].event == 'x3Cube')
                    $scope.events[0].result = result;
                if (response[i].event == 'x4Cube')
                    $scope.events[1].result = result;
                if (response[i].event == 'x5Cube')
                    $scope.events[2].result = result;
                if (response[i].event == 'x2Cube')
                    $scope.events[3].result = result;
                if (response[i].event == 'x3BLD')
                    $scope.events[4].result = result;
                if (response[i].event == 'x3OH')
                    $scope.events[5].result = result;
                if (response[i].event == 'pyra')
                    $scope.events[6].result = result;
            }
        }
    });

    $scope.event;
    $scope.eventId;

    $scope.manualEntry = function(event) {
        if (event.name == "Rubik's Cube")
            $scope.eventId = 'x3Cube';
        if (event.name == "4x4 Cube")
            $scope.eventId = 'x4Cube';
        if (event.name == "5x5 Cube")
            $scope.eventId = 'x5Cube';
        if (event.name == "2x2 Cube")
            $scope.eventId = 'x2Cube';
        if (event.name == "3x3 Blindfolded")
            $scope.eventId = 'x3BLD';
        if (event.name == "3x3 One-Handed")
            $scope.eventId = 'x3OH';
        if (event.name == "Pyraminx")
            $scope.eventId = 'pyra';
        $http.get('/contest/currentWeek').success(function(response) {
            $scope.week = response;
            $http.get('/contest/' + $scope.week + '/' + $scope.eventId + '/scrambles').success(function(response) {
                $scope.solves = [];
                for (var i = 0; i < response.length; i++)
                {
                    $scope.solves[i] = {};
                    $scope.solves[i].result = '';
                    $scope.solves[i].penalty = '';
                    $scope.solves[i].scramble = response[i];
                }
            });
        });
        $scope.showHome = 0;
        $scope.showManualEntry = 1;
        $scope.showTimer = 0;
        $scope.event = event.name;
    };

    $scope.timer = function(event) {
        $scope.showHome = 0;
        $scope.showManualEntry = 0;
        $scope.showTimer = 1;
        $scope.event = event.name;
    };

    $scope.cancel = function() {
        $scope.event = '';
        $scope.showHome = 1;
        $scope.showManualEntry = 0;
        $scope.showTimer = 0;
    };

    $scope.submit = function() {
        $http.post('/contest/' + $scope.week + '/' + $scope.eventId, $scope.solves).success(function (response) {
            $http.get('/contest/results').success(function(response) {
                if (response != null) {
                    for (var i = 0; i < response.length; i++) {
                        var result;
                        if (response[i].times.length == 5)
                            result = calculateAverage(response[i].times, response[i].penalties);
                        else if (response[i].times.length == 3)
                            result = calculateMean(response[i].times, response[i].penalties);
                        if (response[i].event == 'x3Cube')
                            $scope.events[0].result = result;
                        if (response[i].event == 'x4Cube')
                            $scope.events[1].result = result;
                        if (response[i].event == 'x5Cube')
                            $scope.events[2].result = result;
                        if (response[i].event == 'x2Cube')
                            $scope.events[3].result = result;
                        if (response[i].event == 'x3BLD')
                            $scope.events[4].result = result;
                        if (response[i].event == 'x3OH')
                            $scope.events[5].result = result;
                        if (response[i].event == 'pyra')
                            $scope.events[6].result = result;
                    }
                }
            });
        });
        $scope.event = '';
        $scope.showHome = 1;
        $scope.showManualEntry = 0;
        $scope.showTimer = 0;
    };
});

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
    for (var i = 0; i < times.length; i++) {
        var res = times[i].split(':');
        if (res.length > 1)
            times[i] = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
        if ((penalties[i] == '(DNF)') || (times[i] == ''))
            formattedTimes[i] = 'DNF';
        else if (penalties[i] == '(+2)')
            formattedTimes[i] = parseFloat(times[i]) + 2;
        else
            formattedTimes[i] = times[i];
    }
    return formattedTimes;
}

function reformatTime(time) {
    if (parseFloat(time) <  60)
        return time.toFixed(2);
    else {
        var min = (parseFloat(time) / 60).toFixed(0);
        var sec = (parseFloat(time) % 60).toFixed(2);
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

