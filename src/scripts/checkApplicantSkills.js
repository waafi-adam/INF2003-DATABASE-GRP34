// src/scripts/checkApplicantSkills.js

const { ApplicantSkill } = require('../database/sql'); // Adjust the path to your sequelize initialization file

async function checkProfiles() {
  try {
    const applicantSkills = await ApplicantSkill.findAll();
    console.log("Applicant Skills", applicantSkills.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error fetching applicant skills:', error);
  }
}

checkProfiles();
