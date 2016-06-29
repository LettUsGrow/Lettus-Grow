const db = require('monk')('localhost:27017/Lettus-Grow');
var plants = db.get('plants');

plants.options.multi = true;

exports.create = function(potUUID, plant, cb) {
  var defaults = {
    type: 'Basil',
    planted: '01-01-2001',
    health: 'medium',
  };

  plants.insert({
    type: plant.type ? plant.type : defaults.type,
    planted: plant.planted ? plant.planted : defaults.type,
    health: plant.health ? plant.health : defaults.type,
    position: plant.position,
    potUUID: potUUID
  }, function(err) {
    if (err) throw err;
    if(cb) {
      if (err) return cb(err);
      cb(null);
    }
  });
}

exports.updateHealth = function(potUUID, position, health, cb) {
  plants.update({ potUUID: potUUID, position: position },
    { $set: { health: health }}, 
    function(err, docs) {
      if(cb) {
        if (err) return cb(err);
        cb(null);
      }
    });
}

exports.remove = function(potUUID, position, cb) {
  plants.remove({ potUUID: potUUID, position: position }, function(err) {
    if(cb) {
      if (err) return cb(err);
      cb(null);
    }
  });
}

exports.removeAll = function(cb) {
  plants.remove({}, function(err) {
    if(cb) {
      if (err) return cb(err);
      cb(null);
    }
  });
}

exports.get = function(potUUID, position, cb) {
  plants.findOne({ potUUID: potUUID, position: position }, function(err, docs) {
    if (err) return cb(err);
    cb(null, docs);
  });
}

exports.getMultiple = function(potUUIDs, cb) {
  plants.find({ 'potUUID': { $in: potUUIDs }}, function(err, docs) {
    if (err) return cb(err);
    cb(null, docs);
  });
}