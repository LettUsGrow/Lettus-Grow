var express = require('express'),
    router = express.Router(),
    http = require('http'),
    ensure = require('connect-ensure-login'),

    Pot = require('../models/pot');

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

router.get('/status', ensure.ensureLoggedIn(), function(req, res) {
  http.get('http://ludwig.local/updateLights/2/8/', function(ardRes) {
    var body = '';
    ardRes.on('data', function(chunk){ body += chunk; });
    ardRes.on('end', function() {
      res.send(body.split('<')[0]);
    });
  });
});

module.exports = router;