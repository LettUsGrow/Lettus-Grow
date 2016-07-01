var express = require('express'),
    router = express.Router(),

    passport = require('../middlewares/pass'),
    ensure = require('connect-ensure-login'),
    moment = require('moment'),

    Pot = require('../models/pot'),
    Plant = require('../models/plant'),
    User = require('../models/user');

router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), function(req, res) {
  res.redirect('/profile');
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/', ensure.ensureLoggedIn(), function (req, res) {
  User.get(req.user._id, function(err, user) {
    if (err) throw err;

    if(user.pots.length < 1) {
      res.render('index', {
        todaysDate: moment().format('DD-MM-YYYY'),
        user: user,
      });
      return;
    }

    Pot.get(user.pots, function(err, pots) {
      if (err) throw err;

      Plant.getMultiple(user.pots, function(err, plants) {
        if(err) throw err;

        pots = pots.map(function(obj) {
          obj.plants = [null, null, null, null];
          return obj;
        });

        // Get age parameter
        plants = plants.map(function(obj) {
          obj.planted = age(obj.planted);
          return obj;
        });

        // For each plant, we then insert it in to the correct pot
        plants.forEach(function(plant) {
          pots.forEach(function(pot) {
            if(plant.potUUID == pot.UUID) {
              pot.plants[plant.position] = plant;
            }
          });
        });

        res.render('index', {
          todaysDate: moment().format('DD-MM-YYYY'),
          user: user,
          pots: pots ? pots : [],
        }); // res.render
      }); // Plant.getAll
    }); // Pot.get
  }); // User.get
});

function age(date) {
  return moment(new Date(date.split('-').reverse().join('-'))).fromNow(); 
}

function testing() {
  User.removeAll(function(err) {
    Plant.removeAll(function(err) {
      Pot.removeAll(function(err) {

        User.create('Louis', 'true', function() {
          Pot.create(null, null, function(err, pot) {
            User.addPot('Louis', pot.UUID);
            Plant.create(pot.UUID, { position: 1 });
            Plant.create(pot.UUID, { position: 2 });
          });

          Pot.create(null, null, function(err, pot) {
            User.addPot('Louis', pot.UUID);
            Plant.create(pot.UUID, { position: 3 });
            Plant.create(pot.UUID, { position: 4 });
          });
          
          Pot.create(null, null, function(err, pot) {
            User.addPot('Louis', pot.UUID);
          });
        });
      });
    });
  });
};

testing();

module.exports = router;