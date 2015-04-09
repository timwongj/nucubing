var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;
var sessions = require('client-sessions');
var bcrypt = require('bcryptjs');
var path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

// facebook login
passport.use(new FacebookStrategy({
        clientID: '1397096627278092',
        clientSecret: 'e98f10732572cff4bf9a1ccd54288460',
        callbackURL: '/'
    },
    function(accessToken, refreshToken, profile, done) {
        //User.findOrCreate(..., function(err, user) {
        //    if (err) { return done(err); }
        //    done(null, user);
        //});
    }
));

// define session cookie
app.use(sessions({
    cookieName: 'session',
    secret: '69yeahwhydosegjobjbnfnkdsoasa83hkffo'
}));

// connect to mongoDB
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/auth';
mongoose.connect(connectionString);

// define User Schema
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/templates/home.html');
});

app.get('/profile', function(req, res) {
    res.sendfile(__dirname + '/templates/profile.html');
});

app.get('/contest', function(req, res) {
    res.sendfile(__dirname + '/templates/contest.html');
});

app.get('/results', function(req, res) {
    res.sendfile(__dirname + '/templates/results.html');
});

app.get('/tutorials', function(req, res) {
    res.sendfile(__dirname + '/templates/tutorials.html');
});

app.get('/links', function(req, res) {
    res.sendfile(__dirname + '/templates/links.html');
});

app.get('/auth', function(req, res) {
    res.sendfile(__dirname + '/templates/login.html');
    //res.sendfile(__dirname + '/templates/home.html');
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/authStatus', function(req, res) {
    res.json({status:'logged-out'});
});

var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen(port, ip);

