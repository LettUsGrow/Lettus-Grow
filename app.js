var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var uuid = require('uuid');

// For parsing responses from a POST
app.use(bodyParser.urlencoded({ extended: true }));

// var MongoClient = require('mongodb').MongoClient;
// var mongo = require('mongodb');
// var monk = require('monk');

// MongoDB connection
var db = require('monk')('localhost:27017/Lettus-Grow');
// Collections
var users = db.get('users');
var plants = db.get('plants');
var pots = db.get('pots');

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
        startTime: '20:30',
        endTime: '10:30'
      },
      // Should be limited to four
      plants: [
        null,
        null,
        {
          UUID: '59ffe42f-2184-4a3d-8e21-5789d385b0f5',
          type: 'Basil',
          planted: '05-01-2016',
          // position: 3,
          history: [
            {
              timeStamp: 1465550685, // http://www.unixtimestamp.com/
              light: {
                intensities: {
                  blue: 0.5,
                  red: 0.4
                },
                startTime: '20:30',
                endTime: '10:30'
              }
            }
          ]
        },
        null
      ]
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
      },
      plants: [
        null,
        {
          UUID: 'f67549e7-e251-4fd7-a71c-f9e6b3cd9916',
          type: 'Basil',
          // position: 2,
          planted: '05-01-2016',
          history: [
            {
              timeStamp: 1465550685, // http://www.unixtimestamp.com/
              light: {
                intensities: {
                  blue: 0.5,
                  red: 0.4
                },
                startTime: '20:30',
                endTime: '10:30'
              }
            }
          ]
        },
        null,
        null
      ]
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

app.set('view engine', 'pug'); // Formally Jade

app.use(express.static('public'));
app.use(express.static('bower_components'));

app.post('/addPlant', function(req, res) {
  var updatedInfo = req.body;

  // Get current state of pot
  users.find({ "pots.UUID": updatedInfo.potUUID }).on("success", function(doc) {
    console.log();
    console.log(doc.pots[parseInt(updatedInfo.potNumber)]);
    console.log();

    var setModifier = { $set: {} };

    setModifier.$set["pots.$.plants." + updatedInfo.position] = {
      UUID: uuid.v4(), // Create a fresh UUID
      type: updatedInfo.type,
      planted: updatedInfo.plantedTime,
      history: [ // Create the first history insert
        {
          timeStamp: Math.floor(Date.now() / 1000), // Time now in seconds
          light: {
            intensities: {
              blue: 0.5,
              red: 0.4
            },
            startTime: '20:30',
            endTime: '10:30'
          }
        }
      ]
    }

    users.update(
      { "pots.UUID": updatedInfo.potUUID },
      setModifier
    ).on("success", function(doc) { 
      res.redirect('/');
    });
  });
});



app.post('/removePlant', function(req, res) {
  var updatedInfo = req.body,
      setModifier = { $set: {} };

  setModifier.$set["pots.$.plants." + updatedInfo.position] = null;

  users.update(
    { "pots.UUID": updatedInfo.potUUID },
    setModifier
  ).on("success", function(doc) { 
    res.redirect('/');
  });
});





// Authentication required
app.post('/update', function(req, res) {
  var updatedInfo = req.body;

  users.update(
    { "pots.UUID": updatedInfo.UUID },
    { $set:
      {
        "pots.$.light.intensities.blue": updatedInfo.blueIntensity,
        "pots.$.light.intensities.red": updatedInfo.redIntensity,
        "pots.$.light.startTime": updatedInfo.startTime,
        "pots.$.light.endTime": updatedInfo.endTime
      }
  }).on('success', function(doc) { console.log("Successfully updated DB"); });

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