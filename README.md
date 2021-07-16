# SignalWire Mini Contact Center App 

This project is the first of a set of "living" applications that SignalWire will publish to showcase usage of the various APIs as close to real-life as possible.

The Mini Contact Center is an application that will purchase phone numbers and point them at your account, while allowing you to create users and forward the numbers to their personal phones.

In this first installment, we will focus on acquiring and configuring phone numbers via the [SignalWire REST API](https://docs.signalwire.com/topics/relay-rest/#rest-api-reference).

## Application boilerplate

The project is written in Node.JS, using the [Express](https://expressjs.com/) framework, the [Sequelize](https://sequelize.org/) ORM and some other useful libraries. The suggested database is PostgreSQL, and the view template language used is EJS.

For this first iteration, we have two main models, `User` and `Number`. You will need to create an user using the seed data, then you can log in and add more.

As you can see from the [code repository](https://github.com/signalwire/mini-contact-center-node), the Express handlers have been split into modules that are located in the `routes` folder.

## Code dive

### General API requests

The [SignalWire REST API](https://docs.signalwire.com/topics/relay-rest/#rest-api-reference) is not currently part of the main SDK, so we will need to craft requests ourselves. Luckily, they are just JSON requests with HTTP Basic authentication, making it easy to set up a generic API request method.

```js
// in lib/utility.js

async function apiRequest(endpoint, payload = {}, method = 'POST') {
  var url = `https://${process.env.SIGNALWIRE_SPACE}${endpoint}`

  var request = {
    method: method, // *GET, POST, PUT, DELETE, etc.
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Basic ${base64.encode(`${process.env.SIGNALWIRE_PROJECT_KEY}:${process.env.SIGNALWIRE_TOKEN}`)}`
    }
  }

  if (method != 'GET') {
    request.body = JSON.stringify(payload)
  }  
  const response = await fetch(url, request);
  return response.json(); // parses JSON response into native JavaScript objects
}
```

### Listing and purchasing a phone number

Focusing on business logic, the first feature to look at is the number listing feature. SignalWire provides an API that allows you to search by state, area code, or specific number sequences amongst other option. For our application, we chose to implement a simple search based on US states using [this endpoint](https://docs.signalwire.com/topics/relay-rest/#resources-phone-numbers-search-for-available-phone-numbers-to-purchase).

```js
// in routes/numbers.js

router.get('/purchase', utility.isLoggedIn, async function (req, res) {
  var numbers = []
  var selected = req.query.state;
  if (selected) {
    numbers = await utility.apiRequest('/api/relay/rest/phone_numbers/search?region=' + selected, { region: selected }, 'GET')
  }
  // list the numbers so the user can select one to buy
  res.render('numbers/purchase', { states: states.default, selected, numbers: numbers.data });
})
```

When a number is selected, we them move on to buy it with our SignalWire account through [a first endpoint](https://docs.signalwire.com/topics/relay-rest/#resources-phone-numbers-purchase-a-phone-number), and pointing it at the right webhook so it can operate using the [number update API](https://docs.signalwire.com/topics/relay-rest/#resources-phone-numbers-update-a-phone-number).

```js
router.get('/buy', utility.isLoggedIn, async function (req, res) {
  var number = req.query.number;
  if (number) {
    var purchase = await utility.apiRequest('/api/relay/rest/phone_numbers/', { number: number })
    console.log(purchase)
    var num_obj = db.Number.create({ phone_number: number, name: number, sid: purchase.id })

    var handler_payload = { 
      call_handler: 'laml_webhooks',
      call_request_url: `${process.env.HANDLER_URL}/inbound/call`,
      name: number
    }

    var handler = await utility.apiRequest(`/api/relay/rest/phone_numbers/${purchase.id}`, handler_payload, 'PUT')
    res.redirect('/numbers/purchase')
  }
})
```

### Handling inbound calls

Once the phone number is set up, we use the handler URL we set on the number to forward the call to the right user.

```js
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
```

## Configuring and running the application

After cloning the application, you will need a PostgreSQL database available. Edit `config/config.json` adding the relevant credentials.

You will then need to create an `.env` file with the necessary credentials, and the URL to your publicly-reachable HTTP server. Refer to `Testing Locally` below for an example.

### Running the application

Install the necessary libraries by running `npm install`, then run a few commands to create and populate the database:

- `npx sequelize-cli db:create`
- `npx sequelize-cli db:migrate`
- `npx sequelize-cli db:seed:all`

After setting up the database, you can finally run your application with `node index.js` and head to `https://localhost:5000`. Log in with one of the users from `seeders/20210618162021-User.js`.

### Testing locally

You may need to use a SSH tunnel for testing this code – we recommend [ngrok](https://ngrok.com/). After starting the tunnel pointed at your port `5050`, you can use the URL you receive from `ngrok` in your `.env` file.

## Next steps

Stay tuned for the following installments, where we will be adding:

- Call logging
- Messaging
- Web-based phone calls
- Voicemail

## Get started with SignalWire

If you would like to test this example out, you can create a SignalWire account and space [here](https://m.signalwire.com/signups/new?s=1).

Your account will be made in trial mode, which you can exit by making a manual top up of $5.00. You can find more information [on the Trial Mode resource page](https://signalwire.com/resources/getting-started/trial-mode).

If you are looking for more information about using SignalWire, refer to our [Getting Started](https://signalwire.com/resources/getting-started/signalwire-101) guide.

Please feel free to reach out to us on our Community Slack or create a Support ticket if you need guidance!