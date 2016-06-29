var express = require('express');
var app = express();

var https = require('http');
var httpServer = https.createServer(app);

var passport = require('./middlewares/pass');

app.use(require('cookie-parser')('keyboard cat'));
app.use(require('body-parser').urlencoded({ extended: true })); // For parsing responses from a POST
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true })); // cookie: { maxAge: 10 * 60 * 1000 }
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('bower_components'));

app.use(require('./controllers'));

httpServer.listen(8000);