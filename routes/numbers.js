var express = require('express')
var router = express.Router()
const utility = require('../lib/utility');
const states = require('states-us')
const db = require('../models');

router.get('/purchase', utility.isLoggedIn, async function (req, res) {
  var numbers = []
  var selected = req.query.state;
  if (selected) {
    numbers = await utility.apiRequest('/api/relay/rest/phone_numbers/search?region=' + selected, { region: selected }, 'GET')
    console.log(numbers)
  }
  res.render('numbers/purchase', { states: states.default, selected, numbers: numbers.data });
})

router.get('/buy', utility.isLoggedIn, async function (req, res) {
  var number = req.query.number;
  if (number) {
    var purchase = await utility.apiRequest('/api/relay/rest/phone_numbers/', { number: number })
    console.log(purchase)
    var num_obj = db.Number.create({ phone_number: number, name: number, sid: purchase.id })

    var handler_payload = { 
      call_handler: 'laml_webhooks',
      call_request_url: `${process.env.HANDLER_URL}/inbound/call`,
      call_status_callback_url: `${process.env.HANDLER_URL}/inbound/status`,
      name: number
    }

    var handler = await utility.apiRequest(`/api/relay/rest/phone_numbers/${purchase.id}`, handler_payload, 'PUT')
    res.redirect('/numbers/purchase')
  }
})

router.get('/:numberId', utility.isLoggedIn, async function (req, res) {
  var number = await db.Number.findOne({where: {id: req.params.numberId}, include: db.User})
  if (number) {
    res.render('numbers/show', { number })
  } else {
    res.sendStatus(404);
  }
})

router.post('/:numberId', utility.isLoggedIn, async function (req, res) {
  var number = await db.Number.findOne({where: {id: req.params.numberId}, include: db.User})
  if (number) {
    number.UserId = parseInt(req.body.user_id)
    number.save();
    res.redirect('/numbers/' + number.id)
  } else {
    res.sendStatus(404);
  }
})

router.get('/:numberId/edit', utility.isLoggedIn, async function (req, res) {
  var number = await db.Number.findOne({where: {id: req.params.numberId}, include: db.User})
  var users = await db.User.findAll();
  if (number) {
    res.render('numbers/edit', { number, users, errors: [] })
  } else {
    res.sendStatus(404);
  }
})

router.get('/', utility.isLoggedIn, async function (req, res) {
  var numbers = await db.Number.findAll();
  res.render('numbers/index', { numbers })
});

module.exports = router