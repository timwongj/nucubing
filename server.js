var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy;
var fs = require('fs'),
    byline = require('byline');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer());

app.configure(function() {
    app.use(express.static('public'));
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// connect to mongoDB
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/nucubing';
mongoose.connect(connectionString);

// define Schemas
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model('User', new Schema ({
    id:ObjectId,
    facebook_id:String,
    firstName: String,
    lastName: String,
    email:String,
    wcaID:String,
    provider:String
}));

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

// facebook login
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

// render static pages
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/templates/home.html');
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

app.get('/privacy_policy', function(req, res) {
    res.send('Privacy Policy');
});

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

app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/auth' }));

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

// contest temporarily hardcoded
var contest = [];

contest[0] = {};
contest[0].week = '040715';
contest[0].numEvents = 7;
contest[0].events = [];

for (var i = 0; i < contest[0].numEvents; i++)
    contest[0].events[i] = {};

contest[0].events[0].name = 'x3Cube';
contest[0].events[1].name = 'x4Cube';
contest[0].events[2].name = 'x5Cube';
contest[0].events[3].name = 'x2Cube';
contest[0].events[4].name = 'x3BLD';
contest[0].events[5].name = 'x3OH';
contest[0].events[6].name = 'pyra';

contest[0].events[0].numSolves = 5;
contest[0].events[1].numSolves = 5;
contest[0].events[2].numSolves = 5;
contest[0].events[3].numSolves = 5;
contest[0].events[4].numSolves = 3;
contest[0].events[5].numSolves = 5;
contest[0].events[6].numSolves = 5;

for (var i = 0; i < contest[0].numEvents; i++) {
    contest[0].events[i].solves = [];
    for (var j = 0; j < contest[0].events[i].numSolves; j++)
        contest[0].events[i].solves[j] = {};
}

// Rubik's Cube Scrambles
contest[0].events[0].solves[0].scramble = "L' R' B2 L U2 R' B2 L B2 R' F' D' B2 F2 L' B F2 D' U F'";
contest[0].events[0].solves[1].scramble = "D' R2 U2 R' B R' L U2 B' D' L2 U2 F2 L2 B' D2 L2 F' D2 F";
contest[0].events[0].solves[2].scramble = "F2 D2 L' U2 B2 R2 U2 L D R' B' U' B U L' U R B2";
contest[0].events[0].solves[3].scramble = "L2 F2 D2 L2 R B2 D2 U L2 F' U F2 D U2 R2 F L' U2";
contest[0].events[0].solves[4].scramble = "L F L2 B2 L2 U D' R' L U' D2 B' L2 F2 L2 U2 F' R2 F'";

// 4x4 Scrambles
contest[0].events[1].solves[0].scramble = "R2 D2 F2 D2 L2 D2 L2 D B R2 D' F' D' L' U' R F' D2 L Rw2 U' F2 L2 B' Rw2 Fw2 L2 F Rw2 Uw2 U' Rw' L U' L' B Fw' D2 L Uw' U R2 Fw' R2";
contest[0].events[1].solves[1].scramble = "U2 R F' D F2 B U F R B D2 L2 B L2 B' D2 B L2 Uw2 Fw2 D2 U' F Rw2 D B2 D2 B' U2 L2 Rw Uw2 B2 D' F2 L' F' Rw Fw' Uw Fw D";
contest[0].events[1].solves[2].scramble = "D2 B R' F R2 D' U B L' B2 D' R2 U2 B' R2 F B' L2 B U2 Fw2 Uw2 F' Uw2 U2 Rw2 B D' B Uw2 Fw2 U2 F Rw' U F' D L2 Fw' Rw R2 Uw2 U Rw Fw2 U";
contest[0].events[1].solves[3].scramble = "U D B' D2 F D F' R F R2 F B2 R2 F2 U2 L U2 D2 L2 F2 Rw2 U Rw2 L' D U Fw2 L D Fw2 R2 Fw' L D B2 D2 Rw' U R2 Uw' Fw R F'";
contest[0].events[1].solves[4].scramble = "F' D2 U2 F B2 U2 F R2 B L B' U F B' R U2 F' L2 U Rw2 B Rw2 D2 Fw2 D' Rw2 Uw2 F' R2 B2 Rw' F U' F' D2 Rw Fw' D' Rw' D Fw' U' Fw'";

// 5x5 Scrambles
contest[0].events[2].solves[0].scramble = "L R Bw' U2 Lw' Rw B' Bw' U D2 R2 U2 R' L2 Rw B F2 Dw2 D Lw B2 U Fw2 Bw' B' Uw2 Bw' Fw Dw2 R2 Dw Bw U2 F L2 F' R' Fw' Lw U Rw D Fw' Rw' D' U' Rw2 L' B Rw Bw Uw Dw2 F' D' Lw2 Bw' R2 Bw' B";
contest[0].events[2].solves[1].scramble = "D' Dw R Lw' Dw' Lw Bw2 R' Uw2 U B2 Fw2 Bw2 R2 Dw2 Bw2 Lw Bw B' D2 Bw2 D' L' R' Fw2 F Bw' U2 Bw2 U L2 Bw2 L' Lw2 Fw' Lw2 Uw' R' Dw' Lw' R' D' Uw2 Fw' D' Fw R L2 Lw Fw2 Dw' Uw' Rw2 F2 R2 Uw' D2 B2 Uw Lw'";
contest[0].events[2].solves[2].scramble = "B' R2 Uw Fw2 D L' Dw2 Lw2 B' U2 Uw L2 F' R2 Dw2 D2 R' Uw' F L' R' Dw' U B Uw Lw Dw2 Rw' F U2 F2 Fw' L Lw2 Uw Rw' Uw2 F' D' Rw' D B2 F' Fw2 Uw R2 L2 Lw2 Fw2 F' Uw' Lw2 Rw' F Bw U Uw2 Rw' R2 U2";
contest[0].events[2].solves[3].scramble = "Lw' D Bw' Dw D' Uw' L2 D Dw' B2 Uw' R Lw Uw' U2 F' Fw' Lw2 Uw2 Dw Rw Dw Rw F Fw Lw' L2 R2 U Dw Fw2 D2 Bw2 Lw2 Rw' U' B' F' Bw Lw L' Dw' Lw Fw2 Rw' B Dw' Lw' F Lw Uw2 B' Bw Fw2 R' Fw Rw' Fw' Uw Lw";
contest[0].events[2].solves[4].scramble = "L' Bw U' Bw2 L' Dw2 Rw' Dw' Fw' B' Dw' Lw2 Dw2 D' L2 Lw' Uw Dw2 B' L U2 B Lw' R2 L Fw D2 Fw2 Uw Bw' Fw Dw' L2 Lw' Dw2 R' Lw2 Rw2 B Lw Fw L2 Rw2 B' Lw2 Fw' Rw2 D' Lw' R U F2 Dw2 Fw' F2 B' U Uw2 D Dw";

// 2x2 Scrambles
contest[0].events[3].solves[0].scramble = "R' U R U R' F' U2 R U2 R' U'";
contest[0].events[3].solves[1].scramble = "R' F U2 R' U' R U2 R' U' F U'";
contest[0].events[3].solves[2].scramble = "F' R U2 R' U R U2 R' U' F R2";
contest[0].events[3].solves[3].scramble = "R F' R' U' R U' R' F R U2 R";
contest[0].events[3].solves[4].scramble = "U' F U' R U R U' R2 F2 U' R";

// 3x3 Blindfolded Scrambles
contest[0].events[4].solves[0].scramble = "F2 R2 B2 L' U2 L F2 U2 F D2 B' D' B2 F' D U' B' L D2 Rw";
contest[0].events[4].solves[1].scramble = "B2 R2 F2 D2 L2 U2 B' L2 U2 L' R' D R2 U B' L' U2 L R2 Fw' Uw";
contest[0].events[4].solves[2].scramble = "U B2 F2 D F2 L2 U B2 R2 F R' F' R B2 R' B' U' R' B' F Rw2 Uw2";

// 3x3 One-Handed Scrambles
contest[0].events[5].solves[0].scramble = "R' B L2 U B2 D2 B L F D F2 R D2 R2 B2 D2 L B2 R2 U2";
contest[0].events[5].solves[1].scramble = "D2 F2 R2 U2 B2 F' L2 U2 R2 D' F L F' D' B2 R D L2 D2 U";
contest[0].events[5].solves[2].scramble = "R' B2 U2 F2 R2 D2 R' U2 R F2 D' F' R' B' F2 U' F' D' U' F'";
contest[0].events[5].solves[3].scramble = "U2 F2 R U2 L' D2 F2 L D' R U' F2 D' F2 R' B L D F'";
contest[0].events[5].solves[4].scramble = "F2 U2 L U2 L' D2 U2 L' D2 L B2 F' R' U2 L D F U' F' R";

// Pyraminx Scrambles
contest[0].events[6].solves[0].scramble = "L B' U' L' R U B L B U L' u' l r' b";
contest[0].events[6].solves[1].scramble = "R U L' U' L U B R B R U' u' l r' b'";
contest[0].events[6].solves[2].scramble = "R U' R' L B L R' B U' R' L' u l";
contest[0].events[6].solves[3].scramble = "U' B' R' L B' R' B U' R' B U u' l r' b";
contest[0].events[6].solves[4].scramble = "R' L U L R U L' R U L U' u r' b";

// get current week
app.get('/contest/currentWeek', function(req, res) {
    res.send(contest[0].week);
});

// get scrambles
app.get('/contest/:week/:event/scrambles', function(req, res) {
    var week = req.params['week'];
    var event = req.params['event'];
    var weekIndex = -1;
    var eventIndex = -1;
    var scrambles = [];
    for (var i = 0; i < contest.length; i++)
        if (week == contest[i].week)
            weekIndex = i;
    for (var i = 0; i < contest[weekIndex].events.length; i++)
        if (event == contest[weekIndex].events[i].name)
            eventIndex = i;
    for (var i = 0; i < contest[weekIndex].events[eventIndex].numSolves; i++)
        scrambles[i] = contest[weekIndex].events[eventIndex].solves[i].scramble;
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

app.get('/contest/results', function(req, res) {
    Result.find({'week':contest[0].week, 'email':req.user.email}, function(err, result) {
        if (err)
            throw err;
        else
            res.json(result);
    });
});

app.get('/results/:event', function(req, res) {
    Result.find({'week':contest[0].week, 'event':req.params['event']}, function(err, result) {
        if (err)
            throw err;
        else
            res.json(result);
    })
});

var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen(port, ip);

