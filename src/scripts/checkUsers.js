// src/scripts/checkUsers.js

const { User } = require('../database/sql'); // Adjust the path to your sequelize initialization file

async function checkUsers() {
  try {
    const users = await User.findAll();
    console.log("Users:", users.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

checkUsers();
