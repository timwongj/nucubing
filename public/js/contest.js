var app = angular.module('nuCubingApp', ['ui.bootstrap']);

// contest controller
app.controller('contestController', function($scope, $http) {

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

    // events list
    $scope.events = [];
    $scope.events[0] = {name:"Rubik's Cube", result:' '};
    $scope.events[1] = {name:"4x4 Cube", result:' '};
    $scope.events[2] = {name:"5x5 Cube", result:' '};
    $scope.events[3] = {name:"2x2 Cube", result:' '};
    $scope.events[4] = {name:"3x3 Blindfolded", result:' '};
    $scope.events[5] = {name:"3x3 One-Handed", result:' '};
    $scope.events[6] = {name:"Pyraminx", result:' '};

    // get current week contest results for user
    $http.get('/contest/results/current').success(function(response) {
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
        for (var i = 0; i < $scope.events.length; i++) {
            if ($scope.events[i].result == ' ')
                $scope.events[i].result = 'Not Completed';
        }
    });

    // event variables
    $scope.event;
    $scope.eventId;

    // go to manual entry page for the event
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
        $scope.event = event.name;
    };

    // go back to the contest home page
    $scope.cancel = function() {
        $scope.event = '';
        $scope.showHome = 1;
        $scope.showManualEntry = 0;
    };

    // submit results for the given event for the current week
    $scope.submit = function() {
        $http.post('/contest/' + $scope.week + '/' + $scope.eventId, $scope.solves).success(function (response) {
            $http.get('/contest/results/current').success(function(response) {
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
    };
});

// calculate the trimmed average of 5 given the array of times and penalties
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

// calculate the mean of 3 given the array of times and penalties
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

// return an array of results in milliseconds taking penalties into account
function formatTimes(times, penalties) {
    var formattedTimes = [];
    var unsplitTimes = [];
    for (var i = 0; i < times.length; i++) {
        var res = times[i].split(':');
        if (res.length > 1)
            unsplitTimes[i] = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
        else
            unsplitTimes[i] = parseFloat(res[0]);
        if ((penalties[i] == '(DNF)') || (unsplitTimes[i] === ''))
            formattedTimes[i] = 'DNF';
        else if (penalties[i] == '(+2)')
            formattedTimes[i] = parseFloat(unsplitTimes[i]) + 2;
        else
            formattedTimes[i] = unsplitTimes[i];
    }
    return formattedTimes;
}

// convert the time from milliseconds to minutes:seconds.milliseconds
function reformatTime(time) {
    if (isNaN(time))
        return 'DNF';
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

