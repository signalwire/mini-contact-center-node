const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
require('dotenv').config()
const db = require('./models');
const utility = require('./lib/utility');
const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 5000
const app = express();
const http = require('http').createServer(app);

// Simple CORS configuration
var corsOptions = {
  origin: '*'
};
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

db.sequelize.sync();

passport.use(new LocalStrategy(
  { usernameField: 'email',
    passwordField: 'password',
  },
  async function(username, password, done) {
    var user = await db.User.findOne({ where: {email: username }})
    if (!user) { return done(null, false); }
    bcrypt.compare(password, user.password, function(err, result) {
      if (result == true) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  const user = await db.User.findByPk(id);
  if (user === null) {
    const error = new Error('Invalid userId')
    done(error);
  } else {
    done(null, user);
  }
});

app.use(session({
  saveUninitialized: true,
  resave: false,
  secret: 'node-is-crap'
}));

app.use(passport.initialize());
app.use(passport.session());

//layouts and views
app.set('view engine', 'ejs');
var expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);

app.get('/login', async (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/dashboard' }));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//application routes
const numbers = require('./routes/numbers');
app.use('/numbers', numbers)
const users = require('./routes/users');
app.use('/users', users)
const inbound = require('./routes/inbound');
app.use('/inbound', inbound)

app.get('/', async (req, res) => {
  res.render('index');
});

app.get('/dashboard', utility.isLoggedIn, function(req, res) {
  res.render('dashboard');
});

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening to ${PORT}`);
});
