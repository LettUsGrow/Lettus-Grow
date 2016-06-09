var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// For parsing responses from a POST
app.use(bodyParser.urlencoded({ extended: true }));

// var MongoClient = require('mongodb').MongoClient;
// var mongo = require('mongodb');
// var monk = require('monk');

// MongoDB connection
var db = require('monk')('localhost:27017/Lettus-Grow');
var users = db.get('users');

// users.insert({ userId: 'Louis' });
// users.insert({ name: 'Jon', plants: {} });

users.findAndModify({ query: { userId: 'Louis' }, update: { 
  userId: 'Louis', 
  pots: [
    {
      type: 'herbGarden',
      UUID: 'aa0f78e1-d9af-41ad-a164-22e18a055806',
      light: {
        intensities: {
          blue: 0.5,
          red: 0.4
        },
        startTime: '20:30', // Format change? 20*60 + 30 = 1230
        endTime: '10:30'
      }
    },
    {
      type: 'herbGarden',
      UUID: '460443d4-2ae5-43d3-b73a-0b2f695825ff',
      light: {
        intensities: {
          blue: 0.2,
          red: 0.1
        },
        startTime: '21:30', // Format change? 20*60 + 30 = 1230
        endTime: '11:30'
      }
    }
  ]
}});

// users.findAndModify({userId: 'Louis'}, update: { currentPots: {}, exPots: {} } });

// users.remove({}, function (err) {
//   if (err) throw err;
// });

// users.find({}, function (err, docs){
//   console.log(err);
//   console.log(docs);
// });

// Formally Jade
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.static('bower_components'));

// Authentication required
app.post('/update', function(req, res) {
  var updatedInfo = req.body;

  users.update(
    { "pots.UUID": req.body.UUID },
    { $set: {
      "pots.$.light.intensities.blue": updatedInfo.blueIntensity,
      "pots.$.light.intensities.red": updatedInfo.redIntensity,
      "pots.$.light.startTime": updatedInfo.startTime,
      "pots.$.light.endTime": updatedInfo.endTime
    }}
  ).on('success', function(doc) { console.log("Successfully updated DB"); });

  res.redirect('/');
});

// For now we assume there's only one user - Louis
// Display the database information
// Display current plants
app.get('/', function (req, res) {
  users.findOne({ userId: 'Louis' }, function (err, docs) {
    if (err) throw err;

    console.log('GET:');
    console.log(docs.pots);

    res.render('index', docs);
  });
});

app.listen(8000);