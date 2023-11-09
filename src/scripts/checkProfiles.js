// src/scripts/checkProfiles.js

const { ApplicantProfile } = require('../database/sql'); // Adjust the path to your sequelize initialization file

async function checkProfiles() {
  try {
    const profiles = await ApplicantProfile.findAll();
    console.log("Profiles:", profiles.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error fetching profiles:', error);
  }
}

checkProfiles();
