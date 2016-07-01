/*
 * Root file of controllers. Loads other routes.
 */

var express = require('express'),
    router = express.Router(),

    Pot = require('../models/pot'),
    Plant = require('../models/plant'),
    User = require('../models/user');

// Loading other routes
router.use('/profile', require('./profile'));
router.use('/plants', require('./plants'));
router.use('/pots', require('./pots'));

router.get('/', function(req, res) {
  res.render('login');
});

module.exports = router;