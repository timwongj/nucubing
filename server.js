(function() {

  'use strict';

  var express = require('express');
  var path = require('path');
  var fs = require('fs');
  var morgan = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var multer = require('multer');
  var session = require('express-session');
  var RedisStore = require('connect-redis')(session);
  var mongoose = require('mongoose');
  var passport = require('passport');
  var config = require('config');

  var fbAuth = require('./app/middleware/authentication');

  var authRouter = require('./app/routes/auth');
  var resultsRouter = require('./app/routes/results');
  var scramblesRouter = require('./app/routes/scrambles');
  var userRouter = require('./app/routes/user');
  var usersRouter = require('./app/routes/users');
  var weeksRouter = require('./app/routes/weeks');

  var app = express();

  // configuration
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(multer());
  app.use(cookieParser());
  app.use(session({
    store: new RedisStore({
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
  app.use('/public', express.static(__dirname + '/app/public'));

  // render client side dependencies
  app.use('/bower_components',  express.static(__dirname + '/bower_components'));

  app.use('/auth', authRouter);
  app.use('/results', resultsRouter);
  app.use('/scrambles', scramblesRouter);
  app.use('/user', userRouter);
  app.use('/users', usersRouter);
  app.use('/weeks', weeksRouter);

  // passport
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  // connect to mongoDB
  mongoose.connect(config.get('mongo.connectionString'));

  // render home page
  app.get('/', function(req, res) {
    res.sendfile('./app/public/nucubing.html');
  });

  //app.listen(port, ip);
  app.listen(config.get('node.port'), config.get('node.ip'));

})();
