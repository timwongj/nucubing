var app = angular.module('nuCubingApp', ['ui.bootstrap']);

app.controller('resultsController', function($scope, $http) {

    $scope.authStatus = '';

    $http.get('/authStatus').success(function(response) {
        if (response.status == 'connected')
            $scope.authStatus = 'Logout';
        else
            $scope.authStatus = 'Login';
    });

    $scope.events = [];
    $scope.events[0] = {id:'x3Cube', name:"Rubik's Cube"};
    $scope.events[1] = {id:'x4Cube', name:"4x4 Cube"};
    $scope.events[2] = {id:'x5Cube', name:"5x5 Cube"};
    $scope.events[3] = {id:'x2Cube', name:"2x2 Cube"};
    $scope.events[4] = {id:'x3BLD', name:"3x3 Blindfolded"};
    $scope.events[5] = {id:'x3OH', name:"3x3 One-Handed"};
    $scope.events[6] = {id:'pyra', name:"Pyraminx"};

    for (var i = 0; i < $scope.events.length; i++)
        $scope.events[i].results = [];
    var completedRequests = 0;
    for (var i = 0; i < $scope.events.length; i++) {
        $http.get('/results/' + $scope.events[i].id).success(function(response) {
            for (var j = 0; j < response.length; j++) {
                $scope.events[completedRequests].results[j] = {};
                $scope.events[completedRequests].results[j].name = response[j].firstName + ' ' + response[j].lastName;
                if (response[j].times.length == 5)
                    $scope.events[completedRequests].results[j].result = calculateAverage(response[j].times, response[j].penalties);
                if (response[j].times.length == 3)
                    $scope.events[completedRequests].results[j].result = calculateMean(response[j].times, response[j].penalties);
                var details = '';
                for (var k = 0; k < response[j].times.length; k++) {
                    details += response[j].times[k] + response[j].penalties[k];
                    if (k != response[j].times.length - 1)
                        details += ', ';
                }
                $scope.events[completedRequests].results[j].details = details;
            }
            completedRequests++;
        });
    }

    $scope.selectedEvent = $scope.events[0];
    $scope.selectEvent = function(event) {
        $scope.selectedEvent = event;
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
            formattedTimes[i] = (parseFloat(res[0]) * 60) + parseFloat(res[1]);
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
        return parseFloat(time).toFixed(2);
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

