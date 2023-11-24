const express = require('express');
const session = require('express-session');
const passport = require('passport');
const routes = require('../routes/index.js');

const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

// override functions logic
require('./codeblocks/overridefunctions.js');

// setup passport
require('./codeblocks/passportsetup.js');

module.exports = app;
