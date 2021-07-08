# SignalWire Mini Contact Center App 

This project is the first of a set of "living" applications that SignalWire will publish to showcase usage of the various APIs as close to real-life as possible.

The Mini Contact Center is an application that will purchase phone numbers and point them at your account, while allowing you to create users and forward the numbers to their personal phones.

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