'use strict';

const crypto = require('crypto');

module.exports = {
  up: async function(queryInterface, Sequelize) { 
    
    var user_list = [
      {
        name: 'Alice Anderson',
        email: 'alice@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Bob Bradley',
        email: 'bob@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    var users = [];

    user_list.forEach(function (item) {
      var clear_password = '12345678';
      var salt = crypto.randomBytes(64).toString('hex');
      var password = crypto.pbkdf2Sync(clear_password, salt, 10000, 64, 'sha512').toString('base64');

      item.password = password;
      item.salt = salt;
      console.log(item)
      users.push(item)
    });

    queryInterface.bulkInsert('Users', users, {});
  },

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};