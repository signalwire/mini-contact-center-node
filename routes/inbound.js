var express = require('express')
var router = express.Router()
const utility = require('../lib/utility');
const db = require('../models');
const { RestClient } = require('@signalwire/node')

function respondAndLog(res, response) {
  console.log(response.toString());
  res.send(response.toString());
}


router.post('/call', async function (req, res) {
  var response = new RestClient.LaML.VoiceResponse();

  if (req.body.To) {
    var number = await db.Number.findOne({where: {phone_number: req.body.To}, include: db.User})

    if (number && number.User) {
      var dial = response.dial();
      dial.number(number.User.personal_number)
    } else {
      response.say({ message: "Sorry, the number is currently not assigned to an user." })
      response.hangup();
    }
    
  } else {
    response.hangup();
  }
  respondAndLog(res, response)
});

router.get('/status', async function (req, res) {
  res.send("ok")
});

module.exports = router