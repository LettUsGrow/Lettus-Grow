var express = require('express'),
    router = express.Router(),
    Plant = require('../models/plant'),
    ensure = require('connect-ensure-login');

router.post('/add', ensure.ensureLoggedIn(), function(req, res) {
  Plant.get(req.body.potUUID, parseInt(req.body.position), function(err, plant) {
    if (err) throw err;

    if(!plant) {
      Plant.create(req.body.potUUID, req.body, function(err) {
        res.redirect('/');
      });
    }
  });
});

router.post('/remove', ensure.ensureLoggedIn(), function(req, res) {
  Plant.remove(req.body.potUUID, parseInt(req.body.position), function(err) {
    if (err) throw err;

    res.redirect('/');
  });
});

router.post('/health', ensure.ensureLoggedIn(), function(req, res) {
  Plant.updateHealth(req.body.potUUID, parseInt(req.body.position), req.body.health, function(err) {
    if (err) throw err;

    res.redirect('/');
  });
});

module.exports = router;