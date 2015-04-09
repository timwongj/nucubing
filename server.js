var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

// connect to mongoDB
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/auth';
mongoose.connect(connectionString);

// define User Schema
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model('User', new Schema ({
    id: ObjectId,
    firstName: String,
    lastName: String,
    displayName:String,
    email:String,
    username:String,
    provider:String
}));

// facebook login
passport.use(new FacebookStrategy({
        clientID: '1397096627278092',
        clientSecret: 'e98f10732572cff4bf9a1ccd54288460',
        callbackURL: '/'
    }, function(accessToken, refreshToken, profile, done) {
        var providerData = profile._json;
        providerData.accessToken = accessToken;
        providerData.refreshToken = refreshToken;
        var user = new User({
            firstName: profile.name.givenName,
            lastName:profile.name.familyName,
            displayName:profile.displayName,
            email:profile.emails[0].value,
            username:profile.username,
            provider:'facebook'
        });
        user.save();
    }
));

// render static pages
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
    if (!req.user)
        res.sendfile(__dirname + '/templates/login.html');
    else {
        req.logout();
        res.redirect('/');
    }
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/auth' }));

app.get('/authStatus', function(req, res) {
    if (req.user)
        res.json({status:'connected'});
    else
        res.json({status:'not_authorized'});
});

var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen(port, ip);

