'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async function(queryInterface, Sequelize) { 
    
    var user_list = [
      {
        first_name: 'Alice',
        last_name: 'Anderson',
        email: 'alice@example.com',
        personal_number: '+15557788999',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        first_name: 'Bob',
        last_name: 'Bradley',
        email: 'bob@example.com',
        personal_number: '+15559988777',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    var users = [];

    user_list.forEach(async function (item) {
      item.password = bcrypt.hashSync('12345678', 5);
      users.push(item)
    });
    console.log(users)

    queryInterface.bulkInsert('Users', users, {});
  },

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Users', null, {}),
};