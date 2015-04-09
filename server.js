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
var connectionString = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://localhost/auth';
mongoose.connect(connectionString);

// define User Schema
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var User = mongoose.model('User', new Schema ({
    id: ObjectId,
    facebook_id:String,
    token:String,
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
        callbackURL: '/auth/facebook/callback'
    }, function(accessToken, refreshToken, profile, done) {
        process.nextTick(function() {
            User.findOne({'facebook_id':profile.id}, function(err, user) {
                if (err)
                    return done(err);
                if (user)
                    return done(null, user);
                else {
                    console.log('New User');
                    var newUser = new User();
                    newUser.facebook_id = profile.id;
                    newUser.token = profile.accessToken;
                    newUser.firstName = profile.name.givenName;
                    newUser.lastName = profile.name.familyName;
                    newUser.displayName = profile.name.displayName;
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

// if user wants to log out, then log out, otherwise redirect them to the login page
app.get('/auth', function(req, res) {
    if (req.user) {
        req.logout();
        res.redirect('/');
    }
    else
        res.sendfile(__dirname + '/templates/login.html');
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/auth' }));

app.get('/authStatus', function(req, res) {
    if (req.user)
        res.json({status:'connected'});
    else
        res.json({status:'not_authorized'});
});

app.get('/userInfo', function(req, res) {
    res.send(req.user);
});

app.post('/contest/:week/:event', function(req, res) {
    console.log(req.params['week']);
    console.log(req.params['event']);
    console.log(req.user);
    console.log(req.body);
});

var ip = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

app.listen(port, ip);

