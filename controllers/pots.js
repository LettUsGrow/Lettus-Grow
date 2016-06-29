var express = require('express'),
    router = express.Router(),
    Pot = require('../models/pot'),
    ensure = require('connect-ensure-login');

router.post('/update', ensure.ensureLoggedIn(), function(req, res) {
  var update = req.body,
      light = {
        intensities: {
          blue: +update.blueIntensity,
          red: +update.redIntensity
        },
        startTime: update.startTime,
        endTime: update.endTime
      };

  pots.update({ "UUID": update.UUID }, { $set: { "light": light }}, function(err) {
    res.redirect('/');
  }); // pots.update
});

module.exports = router;