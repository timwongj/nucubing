module.exports = function(app) {

    var express = require('express');
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var mongoose = require('mongoose');
    var passport = require('passport'),
        FacebookStrategy = require('passport-facebook').Strategy;
    var fs = require('fs');

    // if user wants to log out, then log out, otherwise redirect them to the login page
    app.get('/auth', function(req, res) {
        if (req.user) {
            req.logout();
            res.redirect('/');
        }
        else
            res.sendfile(__dirname + '/templates/login.html');
    });

    app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/profile', failureRedirect: '/auth' }));

    app.get('/authStatus', function(req, res) {
        if (req.user)
            res.json({status:'connected'});
        else
            res.json({status:'not_authorized'});
    });

    // send user info such as name, email, and facebook id
    app.get('/userInfo', function(req, res) {
        res.send(req.user);
    });

    // set current week
    var currentWeek = '041415';

    // get current week
    app.get('/contest/currentWeek', function(req, res) {
        res.send(currentWeek);
    });

// get scrambles
    app.get('/contest/:week/:event/scrambles', function(req, res) {
        var filename = '';
        if (req.params['event'] == 'x3Cube')
            filename = '3x3x3 Cube Round 1.txt';
        if (req.params['event'] == 'x4Cube')
            filename = '4x4x4 Cube Round 1.txt';
        if (req.params['event'] == 'x5Cube')
            filename = '5x5x5 Cube Round 1.txt';
        if (req.params['event'] == 'x2Cube')
            filename = '2x2x2 Cube Round 1.txt';
        if (req.params['event'] == 'x3BLD')
            filename = '3x3x3 Blindfolded Round 1.txt';
        if (req.params['event'] == 'x3OH')
            filename = '3x3x3 One-Handed Round 1.txt';
        if (req.params['event'] == 'pyra')
            filename = 'Pyraminx Round 1.txt';

        var file = fs.readFileSync('/scrambles/' + req.params['week'] + '/' + filename, 'utf-8');
        var scrambles = file.split('\n');
        scrambles.splice(scrambles.length - 2, 2);
        res.json(scrambles);
    });

    app.post('/contest/:week/:event', function(req, res) {
        var result = new Result();
        result.week = req.params['week'];
        result.event = req.params['event'];
        result.email = req.user.email;
        result.firstName = req.user.firstName;
        result.lastName = req.user.lastName;
        var numSolves = 5;
        if (result.event == 'x3BLD')
            numSolves = 3;
        for (var i = 0; i < numSolves; i++) {
            result.times[i] = req.body[i].result;
            result.penalties[i] = req.body[i].penalty;
        }
        Result.remove({'week':result.week, 'email':result.email, 'event':result.event}, function(err, result) {
            if (err)
                throw err;
        });
        result.save(function(err) {
            if (err)
                throw err;
        });
        res.send(result);
    });

    app.get('/contest/results/current', function(req, res) {
        Result.find({'week':currentWeek, 'email':req.user.email}, function(err, result) {
            if (err)
                throw err;
            else
                res.json(result);
        });
    });

    app.get('/contest/results/all', function(req, res) {
        Result.find({'email':req.user.email}, function(err, result) {
            if (err)
                throw err;
            else
                res.json(result);
        });
    });

    app.get('/results/:week/:event', function(req, res) {
        Result.find({'week':req.params['week'], 'event':req.params['event']}, function(err, result) {
            if (err)
                throw err;
            else
                res.json(result);
        });
    });

}