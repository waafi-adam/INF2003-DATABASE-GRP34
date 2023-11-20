// src/scripts/checkJobSkills.js

const { JobSkill } = require('../database/sql'); // Adjust the path to your sequelize initialization file

async function checkProfiles() {
  try {
    const jobSkills = await JobSkill.findAll();
    console.log("Job Skills", jobSkills.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error fetching job skills:', error);
  }
}

checkProfiles();
