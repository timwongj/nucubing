var express = require('express');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.use(function(req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect('/auth');
    }
  });

  // render contest page
  router.get('/', function(req, res) {
      res.sendfile('./app/public/components/contest/contest.html');
  });

  router.get('/:event/entry', function(req, res) {
    res.sendfile('./app/public/components/contestEntry/contestEntry.html');
  });

  router.get('/:event/timer', function(req, res) {
    res.sendfile('./app/public/components/contestTimer/contestTimer.html');
  });

  router.get('/333fm', function(req, res) {
    res.sendfile('./app/public/components/contestFmc/contestFmc.html');
  });

  router.get('/333mbf', function(req, res) {
    res.sendfile('./app/public/components/contestMbld/contestMbld.html');
  });

  return router;

})();
