var express = require('express');
var app = express();

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));

var MongoClient = require('mongodb').MongoClient;
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/Lettus-Grow');

app.set('view engine', 'pug'); // Formally Jade

app.use(express.static('public'));

app.post('/', function(req, res) {
  console.log(req.body);
  res.render('index');
});

app.get('/', function (req, res) {
  res.render('index', { intensityValue: '10', timingsValue: 50});
});

app.listen(8000);