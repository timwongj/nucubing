'use strict';

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

// render client side dependencies
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// render home page
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/public/components/home/home.html');
});

// render profile page
app.get('/profile', function(req, res) {
    console.log('GET /profile');
    if (req.user)
        res.redirect('/profile/' + req.user.facebook_id);
    else
        res.sendfile(__dirname + '/public/components/login/login.html');
});

// render profile page
app.get('/profile/:id', function(req, res) {
    console.log('GET /profile/' + req.params.id);
    res.sendfile(__dirname + '/public/components/profile/profile.html');
});

// render contest page
app.get('/contest', function(req, res) {
    console.log('GET /contest');
    if (req.user)
        res.sendfile(__dirname + '/public/components/contest/contest.html');
    else
        res.sendfile(__dirname + '/public/components/login/login.html');
});

// render results page
app.get('/results', function(req, res) {
    console.log('GET /results');
    res.sendfile(__dirname + '/public/components/results/results.html');
});

// render links page
app.get('/links', function(req, res) {
    console.log('GET /links');
    res.sendfile(__dirname + '/public/components/links/links.html');
});

// authorization
app.get('/auth', function(req, res) {
    console.log('GET /auth');
    if (req.user) {
        req.logout();
        res.redirect('/');
    }
    else
        res.sendfile(__dirname + '/public/components/login/login.html');
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
    facebook_id:String,
    firstName: String,
    lastName: String,
    email:String,
    week:String,
    event:String,
    data:String
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
    console.log('GET /authStatus');
    if (req.user)
        res.json({status:'connected'});
    else
        res.json({status:'not_authorized'});
});

// send user info such as name, email, and facebook id
app.get('/userInfo', function(req, res) {
    console.log('GET /userInfo');
    res.send(req.user);
});

app.get('/userInfo/id/:id', function(req, res) {
    console.log('GET /userInfo/id/' + req.params.id);
    User.findOne({'facebook_id':req.params['id']}, function(err, user) {
        if (err)
            throw err;
        else
            res.json(user);
    });
});

// set current week
var currentWeek = '080215';

// get current week
app.get('/contest/currentWeek', function(req, res) {
    console.log('GET /contest/currentWeek');
    res.send(currentWeek);
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

// get scrambles given the week and event
app.get('/contest/:week/:event/scrambles', function(req, res) {
    console.log('GET /contest/' + req.params.week + '/' + req.params.event + '/scrambles');
    var filename = eventMap[req.params['event']].fileName;
    var weekPath = 'NU_CUBING_' + req.params['week'].substr(0, 2) + '-' + req.params['week'].substr(2, 2) + '-20' + req.params['week'].substr(4, 2);
    var file = fs.readFileSync('./scrambles/' + weekPath + '/txt/' + filename, 'utf-8');
    var scrambles = file.split('\n');
    scrambles.splice(scrambles.length - eventMap[req.params['event']].extras, eventMap[req.params['event']].extras);
    res.json(scrambles);
});

// get results for the given week and event if they exist
app.get('/contest/results/:week/:event', function(req, res) {
    console.log('GET /contest/results/' + req.params.week + '/' + req.params.event);
    Result.findOne({'week':req.params['week'], 'event':req.params['event'], 'email':req.user.email}, function(err, result) {
        if (err)
            throw err;
        else if (result)
            res.json(result);
    });
});

// submit results for the given week and event
app.post('/contest/submit', function(req, res) {
    console.log('POST /contest/submit');
    var result = new Result();
    result.week = req.body.week;
    result.event = req.body.event;
    result.email = req.user.email;
    result.firstName = req.user.firstName;
    result.lastName = req.user.lastName;
    result.facebook_id = req.user.facebook_id;
    result.data = req.body.data;
    Result.remove({'week':result.week, 'event':result.event, 'email':result.email}, function(err, result) {
        if (err) {
            throw err;
        }
    });
    result.save(function(err) {
        if (err) {
            throw err;
        }
    });
    res.json(result);
});

// get user's contest results for current week
app.get('/contest/results/current', function(req, res) {
    console.log('GET /contest/results/current');
    User.findOne({'facebook_id':req.user.facebook_id}, function(err, user) {
        if (err) {
            throw err;
        } else if (user) {
            Result.find({'week':currentWeek, 'email':user.email}, function(err, result) {
                if (err) {
                    throw err;
                } else {
                    res.json(result);
                }
            });
        }
    });
});

// get contest results for current week given user id
app.get('/profile/results/current/:id', function(req, res) {
    console.log('GET /contest/results/current/' + req.params.id);
    User.findOne({'facebook_id':req.params['id']}, function(err, user) {
        if (err) {
            throw err;
        } else if (user) {
            Result.find({'week':currentWeek, 'email':user.email}, function(err, result) {
                if (err) {
                    throw err;
                } else {
                    res.json(result);
                }
            });
        }
    });
});

// get user's contest results for all weeks
app.get('/contest/results/all', function(req, res) {
    console.log('GET /contest/results/all');
    User.findOne({'facebook_id':req.user.facebook_id}, function(err, user) {
        if (err) {
            throw err;
        } else if (user) {
            Result.find({'email':user.email}, function(err, result) {
                if (err) {
                    throw err;
                } else {
                    res.json(result);
                }
            });
        }
    });
});

// get contest results for all weeks given user id
app.get('/profile/results/all/:id', function(req, res) {
    console.log('GET /contest/results/all/' + req.params.id);
    User.findOne({'facebook_id':req.params['id']}, function(err, user) {
        if (err) {
            throw err;
        } else if (user) {
            Result.find({'email':user.email}, function(err, result) {
                if (err) {
                    throw err;
                } else {
                    res.json(result);
                }
            });
        }
    });
});

// get all results given the week and event
app.get('/results/:week', function(req, res) {
    console.log('GET /results/' + req.params.week);
    Result.find({'week':req.params['week']}, function(err, result) {
        if (err) {
            throw err;
        } else {
            res.json(result);
        }
    });
});

// listen on port and ip
var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen(port, ip);
