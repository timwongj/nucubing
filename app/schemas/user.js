var mongoose = require('mongoose');

module.exports = (function() {

  'use strict';

  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var UserSchema = new mongoose.Schema({
    id: ObjectId,
    facebook_id: String,
    username: String,
    displayName: String,
    name: {},
    firstName: String,
    lastName: String,
    email: String,
    emails: [],
    gender: String,
    profileUrl: String,
    provider: String,
    locale: String,
    timezone: String,
    updated_time: Date,
    created_time: {
      type: Date,
      default: Date.now
    },
    wcaID: String
  });

  var User = mongoose.model('User', UserSchema);

  return User;

})();
