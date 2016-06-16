var express = require('express');
var app = express();
var uuid = require('uuid');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var moment = require('moment');
var bcrypt = require('bcrypt');
var ensure = require('connect-ensure-login');
const saltRounds = 10;

var https = require('http');

var httpServer = https.createServer(app);

// MongoDB connection
var db = require('monk')('localhost:27017/Lettus-Grow');
// Collections
var users = db.get('users');
var plantsAlive = db.get('plantsAlive');
plantsAlive.options.multi = true;
var plantsDead = db.get('plantsDead');
var pots = db.get('pots');

// Configure the local strategy for use by Passport.
passport.use(new Strategy(
  function(username, password, done) {
    users.findOne({username: username}, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }

      bcrypt.compare(password, user.password, function(err, res) {
        if (res == false) { return done(null, false); }
        return done(null, user);
      });
    });
  }));

// Configure Passport authenticated session persistence.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  users.findOne({_id: id}, function (err, user) {
    if (err) { return done(err); }
    done(null, user);
  });
});

app.use(require('cookie-parser')('keyboard cat'));
app.use(require('body-parser').urlencoded({ extended: true })); // For parsing responses from a POST
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true })); // cookie: { maxAge: 10 * 60 * 1000 }
app.use(passport.initialize());
app.use(passport.session());

users.remove({});
plantsAlive.remove({});
plantsDead.remove({});
pots.remove({});

var testUUID_0 = uuid.v4(),
    testUUID_1 = uuid.v4(),
    testUUID_2 = uuid.v4();

bcrypt.hash('password', saltRounds, function(err, hash) {
  users.insert({
    username: 'louis',
    password: hash,
    pots: [testUUID_0, testUUID_1] 
  });
});

pots.insert({
  type: 'Herb',
  UUID: testUUID_0,
  light: {
    intensities: {
      blue: 0.5,
      red: 0.4
    },
    startTime: '20:30',
    endTime: '10:30'
  },
});

pots.insert({
  type: 'Herb',
  UUID: testUUID_1,
  light: {
    intensities: {
      blue: 0.1,
      red: 0.2
    },
    startTime: '12:30',
    endTime: '08:30'
  },
});

plantsAlive.insert({
  type: 'Lettuce',
  planted: '14-06-2016',
  health: 'medium',
  position: 1,
  potUUID: testUUID_0
});

plantsAlive.insert({
  type: 'Basil',
  planted: '15-06-2016',
  health: 'good',
  position: 3,
  potUUID: testUUID_1
});

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('bower_components'));

app.post('/addPlant', 
  ensure.ensureLoggedIn(),
  function(req, res) {
    var update = req.body;

    // Get current state of pot for history purposes
    pots.findOne({ 'UUID': update.potUUID }, function(err, pot) {      
      // Check if there's space?
      plantsAlive.insert({ 
        type: update.type,
        position: parseInt(update.position),
        potUUID: update.potUUID,
        planted: update.planted,
        health: 'good',

        // Create the first history insert
        history: [{ 
          timeStamp: Math.floor(Date.now() / 1000),
          light: pot.light
        }]

      }, function(err, plant) {

        res.redirect('/');
      });
    });
  });


app.post('/removePlant', 
  ensure.ensureLoggedIn(),
  function(req, res) {
    var update = req.body;

    // Get current state of pot for history purposes
    pots.findOne({ 'UUID': update.potUUID }, function(err, pot) {

      plantsAlive.findOne({ "potUUID": update.potUUID, "position": parseInt(update.position) }, function(err, plant) {

        if(plant.history)
          plant.history.push({
            timeStamp: Math.floor(Date.now() / 1000),
            light: pot.light
          });

        plantsDead.insert(plant, function(err) {

          plantsAlive.remove({ "potUUID": update.potUUID, "position": parseInt(update.position) }, function(err) {
            
            res.redirect('/');
          });
        });
      });
    });
  });

app.post('/updateHealth',
  ensure.ensureLoggedIn(), function(req, res) {

    var update = req.body,
        updateHistory = {
          timeStamp: Math.floor(Date.now() / 1000),
          health: update.health
        };

    plantsAlive.update({ potUUID: update.potUUID, position: parseInt(update.position) }, 
      { $push: { history: updateHistory }}, function(err) {

      if(err) throw err;

      plantsAlive.update({ potUUID: update.potUUID, position: parseInt(update.position) }, 
        { $set: { health: update.health }}, function(err) {
        
        if(err) throw err;

        res.redirect('/');
      });
    });
  });

app.post('/updatePot', 
  ensure.ensureLoggedIn(), function(req, res) {

    var update = req.body,
        updateLight = {
          intensities: {
            blue: +update.blueIntensity,
            red: +update.redIntensity
          },
          startTime: update.startTime,
          endTime: update.endTime
        },
        updateHistory = {
          timeStamp: Math.floor(Date.now() / 1000),
          light: updateLight
        };

    pots.update({ "UUID": update.UUID }, { $set: { "light": updateLight }}, function(doc) {

      plantsAlive.update({ "potUUID": update.UUID }, { $push: { history: updateHistory }}, function(err) {

        res.redirect('/');
      });
    });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/profile');
  });

app.get('/',
  function(req, res) {
    res.redirect('/profile');
  });

app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  ensure.ensureLoggedIn(),
  function (req, res) {

    users.findOne({ _id: req.user._id }, function (err, user) { // Get the user
      if (err) throw err;
      pots.find({ 'UUID': { $in: user.pots }}, function(err, usersPots) {  // Using the user, find the pots based on the UUIDs

        plantsAlive.find({ 'potUUID': { $in: user.pots }}, function(err, usersPlants) {

          usersPlants.sort(function(a, b) {
            return a.position - b.position;
          });

          // Get age parameter
          usersPlants = usersPlants.map(function(obj) {
            obj.planted = age(obj.planted);
            return obj;
          });

          res.render('index', {
            todaysDate: moment().format('DD-MM-YYYY'),
            user: user,
            pots: usersPots ? usersPots : [],
            plants: usersPlants ? usersPlants : []
          });
        });
      });
    });
  });

function age(date) {
 return moment(new Date(date.split('-').reverse().join('-'))).fromNow(); 
}

app.use(function errorHandler(err, req, res, next) {
  res.status(500);
  res.render('error', { error: err });
  });

httpServer.listen(8000);