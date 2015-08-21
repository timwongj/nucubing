var express = require('express');
var passport = require('passport');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  // authorization
  router.route('/')
    .get(function(req, res) {
      if (req.user) {
        req.logout();
        res.redirect('/');
      }
      else
        res.redirect('/auth/facebook');
    });

  // facebook authentication route
  router.route('/facebook')
    .get(passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

  // facebook callback route
  router.route('/facebook/callback')
    .get(passport.authenticate('facebook', { successRedirect: '/#/profile', failureRedirect: '/auth' }));

  return router;

})();
