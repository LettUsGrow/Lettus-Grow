var express = require('express');
var app = express();
var uuid = require('uuid');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;

var https = require('http');
// var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
// var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var httpServer = https.createServer(app);

// MongoDB connection
var db = require('monk')('localhost:27017/Lettus-Grow');
// Collections
var users = db.get('users');
var plantsAlive = db.get('plantsAlive');
var plantsDead = db.get('plantsDead');
var pots = db.get('pots');

// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function(username, password, done) {
    users.findOne({username: username}, function(err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password != password) { return done(null, false); }
      return done(null, user);
    });
  }));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  users.findOne({_id: id}, function (err, user) {
    if (err) { return done(err); }
    done(null, user);
  });
});

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true })); // For parsing responses from a POST
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

users.remove({});
plantsAlive.remove({});
plantsDead.remove({});
pots.remove({});

var testUUID_0 = uuid.v4(),
    testUUID_1 = uuid.v4(),
    testUUID_2 = uuid.v4();

users.insert({
  username: 'louis',
  password: 'test',
  pots: [testUUID_0, testUUID_1] 
});

pots.insert({
  type: 'herb',
  UUID: testUUID_0,
  light: {
    intensities: {
      blue: 0.5,
      red: 0.4
    },
    startTime: '20:30',
    endTime: '10:30'
  },
  // plants: [null, null, null, null]
});

pots.insert({
  type: 'herb',
  UUID: testUUID_1,
  light: {
    intensities: {
      blue: 0.1,
      red: 0.2
    },
    startTime: '12:30',
    endTime: '08:30'
  },
  // plants: [null, null, null, null]
});

plantsAlive.insert({
  type: 'Lettuce',
  planted: '11-05-2016',
  position: 1,
  potUUID: testUUID_0
});

plantsAlive.insert({
  type: 'Basil',
  planted: '14-05-2016',
  position: 3,
  potUUID: testUUID_1
});

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('bower_components'));

app.post('/addPlant', 
  require('connect-ensure-login').ensureLoggedIn(),
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
  require('connect-ensure-login').ensureLoggedIn(),
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


app.post('/updatePot', 
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res) {
  var update = req.body,
      light = {
        intensities: {
          blue: +update.blueIntensity,
          red: +update.redIntensity
        },
        startTime: update.startTime,
        endTime: update.endTime
      };

  pots.update({ "UUID": update.UUID },
    { $set: { "light": light }
  }).on('success', function(doc) { 
    res.redirect('/');
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
  require('connect-ensure-login').ensureLoggedIn(),
  function (req, res) {

    users.findOne({ _id: req.user._id }, function (err, user) { // Get the user
      if (err) throw err;
      pots.find({ 'UUID': { $in: user.pots }}, function(err, usersPots) {  // Using the user, find the pots based on the UUIDs

        plantsAlive.find({ 'potUUID': { $in: user.pots }}, function(err, usersPlants) {

          usersPlants.sort(function(a, b) {
            return a.position - b.position;
          });

          res.render('index', {
            user: user,
            pots: usersPots ? usersPots : [],
            plants: usersPlants ? usersPlants : []
          });
        });
      });
    });
  });

httpServer.listen(8000);