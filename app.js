var express = require('express');
var app = express();

var http = require('http');
var httpServer = http.createServer(app);

// Any middleware lives here. Currently just passport, which authenticates users
var passport = require('./middlewares/pass');

// For parsing responses from a POST request
app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: true }));

// All of these are basically for authenticating users
app.use(require('cookie-parser')('keyboard cat'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'pug');
// So we can serve static assets like images
app.use(express.static('public'));
app.use(express.static('bower_components'));

// All the routes live in here
app.use(require('./controllers'));

// Finally create the server and listen on port 8000
httpServer.listen(8000);