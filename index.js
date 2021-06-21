const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const db = require('./models');
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
    console.log('LocalStrategy', username, password)
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

app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
  res.send('home');
});

function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/dashboard', isLoggedIn, function(req, res) {
  res.render('dashboard');
});

app.get('/otherpage', isLoggedIn, function(req, res) {
  res.send('otherpage');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/dashboard' }));

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening to ${PORT}`);
});
