var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
var config = require('config');
var User = require('../schemas/user');

module.exports = (function() {

  var fbAuth = passport.use(new FacebookStrategy({
      clientID: config.get('passport.facebook.clientID'),
      clientSecret: config.get('passport.facebook.clientSecret'),
      callbackURL: '/auth/facebook/callback'
    }, function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        User.findOne({'facebook_id': profile.id}, function(err, user) {
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
            var newUser = new User({
              facebook_id: profile.id,
              username: profile.username,
              displayName: profile.displayName,
              name: profile.name,
              firstName: profile.name.givenName,
              lastName: profile.name.familyName,
              email: profile.emails[0].value,
              emails: profile.emails,
              gender: profile.gender,
              profileUrl: profile.profileUrl,
              provider: profile.provider,
              locale: profile._json.locale,
              timezone: profile._json.timezone,
              updated_time: profile._json.updated_time
            });
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
