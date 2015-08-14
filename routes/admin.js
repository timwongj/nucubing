var express = require('express');
var passport = require('passport');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.use(function(req, res, next) {
    if (!(req.user && (req.user.email == 'timothywong8@gmail.com'))) {
      res.status(401).send('You are not authorized to view this page.');
    } else {
      next();
    }
  });

  router.get('/', function(req, res) {
    res.sendfile('./public/components/admin/admin.html');
  });

  return router;

})();
