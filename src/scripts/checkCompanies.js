// src/scripts/checkCompanies.js

const { Company } = require('../database/sql'); 

async function checkCompanies() {
  try {
    const companies = await Company.findAll();
    console.log("Companies:", companies.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error fetching companies:', error);
  }
}

checkCompanies();
