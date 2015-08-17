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
  secret: config.get('express.session.secret'),
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// render static files
app.use('/app/public', express.static(__dirname + '/app/public'));

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

var User = require('./app/models/user');
var Result = require('./app/models/result');

var profile = require('./app/routes/profile');
var users = require('./app/routes/users');
var contest = require('./app/routes/contest');
var results = require('./app/routes/results');
var auth = require('./app/routes/auth');
var admin = require('./app/routes/admin');

app.use('/profile', profile);
app.use('/users', users);
app.use('/contest', contest);
app.use('/results', results);
app.use('/auth', auth);
app.use('/admin', admin);

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

// render home page
app.get('/', function(req, res) {
  res.sendfile('./app/public/components/home/home.html');
});

// render links page
app.get('/links', function(req, res) {
  res.sendfile('./app/public/components/links/links.html');
});

//app.listen(port, ip);
app.listen(config.get('node.port'), config.get('node.ip'));
