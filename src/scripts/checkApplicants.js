// src/scripts/checkProfiles.js

const { Applicant } = require('../database/sql'); // Adjust the path to your sequelize initialization file

async function checkProfiles() {
  try {
    const applicants = await Applicant.findAll();
    console.log("Applicants:", applicants.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error fetching applicants:', error);
  }
}

checkProfiles();
