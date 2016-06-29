var db = require('monk')('localhost:27017/Lettus-Grow'),
    pots = db.get('pots'),
    uuid = require('uuid');

exports.create = function(type, light, cb) {
  var defaults = {
    type: "Herb garden",
    light: {
      intensities: {
        blue: 0.5,
        red: 0.5
      },
      startTime: '22:00',
      endTime: '06:00'
    }
  }

  pots.insert({
    type: type ? type : defaults.type,
    UUID: uuid.v4(),
    light: light ? light : defaults.light
  }, function(err, doc) {
    if(cb) {
      if (err) return cb(err);
      cb(null, doc);
    }
  });
}

exports.get = function(potUUIDs, cb) {
  if(potUUIDs.constructor != Array) potUUIDs = [potUUIDs];
  pots.find({ UUID: { $in: potUUIDs }}, function(err, docs) {
    if (err) return cb(err);
    cb(null, docs);
  });
}

exports.remove = function(UUID) {
  pots.remove({ UUID: UUID });
}

exports.removeAll = function(cb) {
  pots.remove({}, function(err) {
    if(cb) {
      if (err) return cb(err);
      cb(null);
    }
  });
}