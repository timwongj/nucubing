var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
var config = require('config');
var User = require('../models/user');

module.exports = (function() {

  var fbAuth = passport.use(new FacebookStrategy({
      clientID: config.get('passport.facebook.clientID'),
      clientSecret: config.get('passport.facebook.clientSecret'),
      callbackURL: '/auth/facebook/callback'
    }, function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        User.findOne({'email':profile.emails[0].value}, function(err, user) {
          if (err) {
            return done(err);
          } else if (user) {
            if (user.updated_time.getTime() != (new Date(profile.updated_time)).getTime()) {
              user.facebook_id = profile.id;
              user.username = profile.username;
              user.displayName = profile.displayName;
              user.name = profile.name;
              user.firstName = profile.name.givenName;
              user.lastName = profile.name.familyName;
              user.email = profile.emails[0].value;
              user.emails = profile.emails;
              user.gender = profile.gender;
              user.profileUrl = profile.profileUrl;
              user.provider = profile.provider;
              user.locale = profile._json.locale;
              user.timezone = profile._json.timezone;
              user.updated_time = profile._json.updated_time;
              user.save(function(err) {
                if (err) {
                  throw err;
                }
              });
            }
            return done(null, user);
          } else {
            var newUser = new User();
            newUser.facebook_id = profile.id;
            newUser.username = profile.username;
            newUser.displayName = profile.displayName;
            newUser.name = profile.name;
            newUser.firstName = profile.name.givenName;
            newUser.lastName = profile.name.familyName;
            newUser.email = profile.emails[0].value;
            newUser.emails = profile.emails;
            newUser.gender = profile.gender;
            newUser.profileUrl = profile.profileUrl;
            newUser.provider = profile.provider;
            newUser.locale = profile._json.locale;
            newUser.timezone = profile._json.timezone;
            newUser.updated_time = profile._json.updated_time;
            newUser.save(function(err) {
              if (err) {
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      });
    }
  ));

  return fbAuth;

})();
