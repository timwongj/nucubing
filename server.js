'use strict';

var express = require('express');
var path = require('path');
var fs = require('fs');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var session = require('express-session');
var redisStore = require('connect-redis')(session);
var mongoose = require('mongoose');
var passport = require('passport'),
  FacebookStrategy = require('passport-facebook').Strategy;
var config = require('config');

var app = express();

// configuration
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());
app.use(cookieParser());
app.use(session({
    store: new redisStore({
        host: config.get('redisStore.host'),
        port: config.get('redisStore.port'),
        pass: config.get('redisStore.pass')
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// render static files
app.use('/public', express.static(__dirname + '/public'));

// render client side dependencies
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// passport
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// connect to mongoDB
mongoose.connect(config.get('mongo.connectionString'));

var User = require('./models/user');
var Result = require('./models/result');

// render home page
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/components/home/home.html');
});

var profile = require('./routes/profile');
var contest = require('./routes/contest');
var results = require('./routes/results');
var auth = require('./routes/auth');

app.use('/profile', profile);
app.use('/contest', contest);
app.use('/results', results);
app.use('/auth', auth);

// render links page
app.get('/links', function(req, res) {
    res.sendfile(__dirname + '/public/components/links/links.html');
});

var eventMap = {
    'x3Cube' : {fileName : '3x3x3 Cube Round 1.txt', scrambles : 5, extras : 2},
    'x4Cube' : {fileName: '4x4x4 Cube Round 1.txt', scrambles : 5, extras : 2},
    'x5Cube' : {fileName: '5x5x5 Cube Round 1.txt', scrambles : 5, extras : 2},
    'x2Cube' : {fileName: '2x2x2 Cube Round 1.txt', scrambles : 5, extras : 2},
    'x3BLD' : {fileName: '3x3x3 Blindfolded Round 1.txt', scrambles : 3, extras : 2},
    'x3OH' : {fileName: '3x3x3 One-Handed Round 1.txt', scrambles : 5, extras : 2},
    'x3FMC' : {fileName: '3x3x3 Fewest Moves Round 1.txt', scrambles : 3, extras : 0},
    'x3FT' : {fileName: '3x3x3 With Feet Round 1.txt', scrambles : 3, extras : 2},
    'mega' : {fileName: 'Megaminx Round 1.txt', scrambles : 5, extras : 2},
    'pyra' : {fileName: 'Pyraminx Round 1.txt', scrambles : 5, extras : 2},
    'sq1' : {fileName: 'Square-1 Round 1.txt', scrambles : 5, extras : 2},
    'clock' : {fileName: 'Rubik\'s Clock Round 1.txt', scrambles : 5, extras : 2},
    'skewb' : {fileName: 'Skewb Round 1.txt', scrambles : 5, extras : 2},
    'x6Cube' : {fileName: '6x6x6 Cube Round 1.txt', scrambles : 3, extras : 2},
    'x7Cube' : {fileName: '7x7x7 Cube Round 1.txt', scrambles : 3, extras : 2},
    'x4BLD' : {fileName: '4x4x4 Cube Blindfolded Round 1.txt', scrambles : 3, extras : 2},
    'x5BLD' : {fileName: '5x5x5 Cube Blindfolded Round 1.txt', scrambles : 3, extras : 2},
    'x3MBLD' : {fileName: '3x3x3 Multiple Blindfolded Round 1.txt', scrambles : 35, extras : 0}
};

// Facebook login
passport.use(new FacebookStrategy({
        clientID: config.get('passport.facebook.clientID'),
        clientSecret: config.get('passport.facebook.clientSecret'),
        callbackURL: '/auth/facebook/callback'
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            User.findOne({'email':profile.emails[0].value}, function(err, user) {
                if (err)
                    return done(err);
                if (user)
                    return done(null, user);
                else {
                    var newUser = new User();
                    newUser.facebook_id = profile.id;
                    newUser.firstName = profile.name.givenName;
                    newUser.lastName = profile.name.familyName;
                    newUser.email = profile.emails[0].value;
                    newUser.provider = 'facebook';
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }
));

//app.listen(port, ip);
app.listen(config.get('node.port'), config.get('node.ip'));
