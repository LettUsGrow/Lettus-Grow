var db = require('monk')('localhost:27017/Lettus-Grow'),
    users = db.get('users'),
    bcrypt = require('bcrypt');

const saltRounds = 10;
users.options.multi = false;

exports.create = function(username, password, cb) {
  bcrypt.hash(password, saltRounds, function(err, hash) {
    users.insert({
      username: username,
      password: hash,
      pots: []
    }, function(err, doc) {
      if(cb) {
        if (err) return cb(err);
        cb(null, doc);
      }
    }); // users.insert
  }); // bcrypt.hash
}

exports.getAll = function(cb) {
  users.find({}, function(err, doc) {
    if (err) return cb(err);
    cb(null, doc);
  });
}

exports.get = function(_id, cb) {
  users.findOne({ _id: _id }, function (err, doc) {
    if (err) return cb(err);
    cb(null, doc);
  }); // users.findOne
}

exports.addPot = function(username, potUUID) {
  users.update(
    { username: username },
    { $push: {
        pots: potUUID
      }
    }
  ); // users.update
}

exports.changePassword = function(username, newPassword) {
  bcrypt.hash(password, saltRounds, function(err, hash) {
    users.update(
      { username: username },
      { $set: {
          password: hash
        }
      }
    ); // users.update
  }); // bcrypt.hash
}

exports.removeAll = function(cb) {
  users.remove({}, function(err) {
    if(cb) {
      if (err) return cb(err);
      cb(null);
    }
  });
}

exports.remove = function(username) {
  users.remove({ username: username });
}