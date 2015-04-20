var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
var fs = require('fs');

// configuration
app.configure(function() {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(multer());
    app.use(express.static('public'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({secret: 'dose you eben gj?'}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
});

// passport
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// connect to mongoDB
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/nucubing';
mongoose.connect(connectionString);

// render static files
app.use(express.static(__dirname + '/public'));

// render home page
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/templates/home.html');
});

// render profile page
app.get('/profile', function(req, res) {
    if (req.user)
        res.sendfile(__dirname + '/templates/profile.html');
    else
        res.sendfile(__dirname + '/templates/login.html');
});

// render contest page
app.get('/contest', function(req, res) {
    if (req.user)
        res.sendfile(__dirname + '/templates/contest.html');
    else
        res.sendfile(__dirname + '/templates/login.html');
});

// render results page
app.get('/results', function(req, res) {
    res.sendfile(__dirname + '/templates/results.html');
});

// render links page
app.get('/links', function(req, res) {
    res.sendfile(__dirname + '/templates/links.html');
});

// authorization
app.get('/auth', function(req, res) {
    if (req.user) {
        req.logout();
        res.redirect('/');
    }
    else
        res.sendfile(__dirname + '/templates/login.html');
});

// define Schemas
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// User Schema
var User = mongoose.model('User', new Schema ({
    id:ObjectId,
    facebook_id:String,
    firstName: String,
    lastName: String,
    email:String,
    wcaID:String,
    provider:String
}));

// Result Schema
var Result = mongoose.model('Result', new Schema ({
    id:ObjectId,
    week:String,
    event:String,
    email:String,
    firstName: String,
    lastName: String,
    times:[String],
    penalties:[String]
}));

// Facebook login
passport.use(new FacebookStrategy({
        clientID: '1397096627278092',
        clientSecret: 'e98f10732572cff4bf9a1ccd54288460',
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

// facebook authentication route
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

// facebook callback route
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/profile', failureRedirect: '/auth' }));

// get authorization status
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

// get scrambles given the week and event
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
    var file = fs.readFileSync('./scrambles/' + req.params['week'] + '/' + filename, 'utf-8');
    var scrambles = file.split('\n');
    scrambles.splice(scrambles.length - 2, 2);
    res.json(scrambles);
});

// submit results for the given week and event
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

// get user's contest results for current week
app.get('/contest/results/current', function(req, res) {
    Result.find({'week':currentWeek, 'email':req.user.email}, function(err, result) {
        if (err)
            throw err;
        else
            res.json(result);
    });
});

// get user's contest results for all weeks
app.get('/contest/results/all', function(req, res) {
    Result.find({'email':req.user.email}, function(err, result) {
        if (err)
            throw err;
        else
            res.json(result);
    });
});

// get all results given the week and event
app.get('/results/:week/:event', function(req, res) {
    Result.find({'week':req.params['week'], 'event':req.params['event']}, function(err, result) {
        if (err)
            throw err;
        else
            res.json(result);
    });
});

// listen on port and ip
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen(port, ip);
