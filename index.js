const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session')

// Fake User
const user = {
  id: '123456',
  name: 'Edoardo',
  surname: 'Gallo',
  username: 'edoardo',
}

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

// const db = require('./models');
// db.sequelize.sync();

passport.use(new LocalStrategy(
  { usernameField: 'email',
    passwordField: 'password',
  },
  function(username, password, done) {
    console.log('LocalStrategy', username, password)
    // User.findOne({ username: username }, function (err, user) {
    //   if (err) { return done(err); }
    //   if (!user) { return done(null, false); }
    //   if (!user.verifyPassword(password)) { return done(null, false); }
    //   return done(null, user);
    // });
    // TODO: Replace with query above
    if (username === user.username) {
      return done(null, user);
    }

    const error = new Error('Invalid Username')
    return done(error);
  }
));

passport.serializeUser(function(user, done) {
  console.log('serializeUser', user)
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id)
  // User.findById(id, function (err, user) {
  //   done(err, user);
  // });
  // TODO: Replace with query above
  if (id === '123456') {
    console.log('Found User!', user)
    done(null, user);
  } else {
    const error = new Error('Invalid userId')
    done(error);
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

app.get('/', (req, res) => {
  res.send('index');
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

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/dashboard' }));

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening to ${PORT}`);
});
