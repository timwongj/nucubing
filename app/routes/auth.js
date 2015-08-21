var express = require('express');
var passport = require('passport');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // authorization
  router.get('/', function(req, res) {
    if (req.user) {
      req.logout();
      res.redirect('/');
    }
    else
      res.sendfile('./app/public/components/login/login.html');
  });

  // facebook authentication route
  router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

  // facebook callback route
  router.get('/facebook/callback', passport.authenticate('facebook', { successRedirect: '/profile', failureRedirect: '/auth' }));

  return router;

})();
