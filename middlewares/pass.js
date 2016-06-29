var db = require('monk')('localhost:27017/Lettus-Grow'),
    users = db.get('users'),
    passport = require('passport'),
    Strategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt');

// Configure the local strategy for use by Passport.
passport.use(new Strategy(
  function(username, password, done) {
    users.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }

      bcrypt.compare(password, user.password, function(err, res) {
        if (res == false) { return done(null, false); }
        return done(null, user);
      });
    });
  }));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  users.findOne({_id: id}, function (err, user) {
    if (err) { return done(err); }
    done(null, user);
  });
});

module.exports = passport;