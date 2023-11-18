// src/scripts/checkSessions.js

const { Session } = require('../database/sql'); // Adjust the path to your sequelize initialization file

async function checkSessions() {
  try {
    const users = await Session.findAll();
    console.log("Sessions:", users.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }
}

checkSessions();
