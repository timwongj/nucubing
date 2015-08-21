var express = require('express');

module.exports = (function() {

  'use strict';

  var router = express.Router();

  var admins = ['timothywong8@gmail.com'];

  router.get('/', function(req, res) {
    if (!(req.user && (admins.indexOf(req.user.email) >= 0))) {
      res.status(401).send('You are not authorized to view this page.');
    } else {
      res.sendfile('./app/public/components/admin/admin.html');
    }
  });

  return router;

})();
