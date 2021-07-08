var express = require('express')
var router = express.Router()
const utility = require('../lib/utility');
const db = require('../models');
const bcrypt = require('bcrypt');

const { body, validationResult } = require('express-validator');

router.get('/', utility.isLoggedIn, async function (req, res) {
  var users = await db.User.findAll();
  console.log(users)
  res.render('users/index', { users })
});

router.get('/new', utility.isLoggedIn, async function (req, res) {
  var user = await db.User.build();
  res.render('users/new', { user, errors: [] })
});

router.post('/create', utility.isLoggedIn,
body('email', 'Email is invalid or empty').isEmail(),
body('first_name', 'First name is required').notEmpty(),
body('last_name', 'Last name is required').notEmpty(),
body('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
body('personal_number').isMobilePhone('en-US'),
async function (req, res) {
  const errors = validationResult(req);
    var user = await db.User.build({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      personal_number: req.body.personal_number,
    });
    if (!errors.isEmpty()) {
      res.render('users/new', { user, errors: errors.array() })
    } else {
      user.password = bcrypt.hashSync(req.body.password, 5)
      await user.save();
      res.redirect('/users/' + user.id);
    }
});

router.get('/:userId', utility.isLoggedIn, async function (req, res) {
  var user = await db.User.findOne({where: {id: req.params.userId}})
  if (user) {
    res.render('users/show', { user })
  } else {
    res.sendStatus(404);
  }
});

router.get('/:userId/edit', utility.isLoggedIn, async function (req, res) {
  var user = await db.User.findOne({where: {id: req.params.userId}});
  if (user) {
    res.render('users/edit', { user, errors: [] })
  } else {
    res.sendStatus(404);
  }
});

router.post('/:userId', utility.isLoggedIn,
body('email', 'Email is invalid or empty').isEmail(),
body('first_name', 'First name is required').notEmpty(),
body('last_name', 'Last name is required').notEmpty(),
body('password', 'Password must be at least 8 characters').isLength({ min: 8 }),
body('personal_number').isMobilePhone('en-US'),
async function (req, res) {
  const errors = validationResult(req);
  var user = await db.User.findOne({where: {id: req.params.userId}});
  if (!errors.isEmpty()) {
    res.render('users/' + user.id + '/edit', { user, errors: errors.array() })
  } else {
    await user.update({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      personal_number: req.body.personal_number,
      password: bcrypt.hashSync(req.body.password, 5)
    });
    res.redirect('/users/' + user.id);
  }
});

module.exports = router