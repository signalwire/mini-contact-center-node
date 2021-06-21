const app = require('express')();
const bodyParser = require('body-parser');
const http = require('http').createServer(app);
const cors = require("cors");
const cookieParser = require('cookie-parser');
const passport = require('passport');

const PORT = process.env.PORT || 5000

// Simple CORS configuration
var corsOptions = {
  origin: "*"
};
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

const db = require("./models");
db.sequelize.sync();

const expressSession = require('express-session');
const SessionStore = require('express-session-sequelize')(expressSession.Store);
const sequelizeSessionStore = new SessionStore({
  db: db.sequelize,
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(db.User.createStrategy());

passport.serializeUser(db.User.serializeUser());
passport.deserializeUser(db.User.deserializeUser());

app.use(cookieParser());
app.use(expressSession({
    secret: 'keep it secret, keep it safe.',
    store: sequelizeSessionStore,
    resave: false,
    saveUninitialized: false,
}));

app.set('view engine', 'ejs');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect('/login')
}

app.get('/', (req, res) => {
  res.send('index');
});

app.get('/dashboard', isLoggedIn, (req, res) => {
  res.send('dashboard');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local'), (req, res), function(req, res, next) {
  console.log(req.body)
  // db.User.findOne({where: {
  //   email: req.body.email
  // }}, (err, person) => {
  //   res.redirect('/dashboard');
  // })
});

http.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening to ${PORT}`);
});