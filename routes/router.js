var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
var fs = require('fs');
var path = require('path');

module.exports = function(app) {

    // render static pages
    app.use(express.static(__dirname + '/public'));

    app.get('/', function(req, res) {
        res.sendfile(path.resolve('../', '/templates/home.html'));
    });

    app.get('/profile', function(req, res) {
        if (req.user)
            res.sendfile(__dirname + '/templates/profile.html');
        else
            res.sendfile(__dirname + '/templates/login.html');
    });

    app.get('/contest', function(req, res) {
        if (req.user)
            res.sendfile(__dirname + '/templates/contest.html');
        else
            res.sendfile(__dirname + '/templates/login.html');
    });

    app.get('/results', function(req, res) {
        res.sendfile(__dirname + '/templates/results.html');
    });

    app.get('/links', function(req, res) {
        res.sendfile(__dirname + '/templates/links.html');
    });

}