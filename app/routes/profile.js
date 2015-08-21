var express = require('express');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  router.get('/', function(req, res) {
    if (req.user) {
      res.sendfile('./app/public/components/profile/profile.html');
    } else {
      res.redirect('/auth');
    }
  });

  return router;

})();
