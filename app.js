var express = require('express');
var app = express();

var http = require('http');
var httpServer = http.createServer(app);

var passport = require('./middlewares/pass');

app.use(require('cookie-parser')('keyboard cat'));
app.use(require('body-parser').json());
app.use(require('body-parser').urlencoded({ extended: true })); // For parsing responses from a POST
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true })); // cookie: { maxAge: 10 * 60 * 1000 }
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'pug');
app.use(express.static('public'));
app.use(express.static('bower_components'));

app.use(require('./controllers'));

app.use(function(err, req, res, next) {
  if(err.status !== 404) {
    return next();
  }
 
  res.status(404);
  res.send(err.message || '** no unicorns here **');
});

httpServer.listen(8000);