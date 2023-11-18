// src/scripts/checkJobs.js

const { Job } = require('../database/sql'); 

async function checkJobs() {
  try {
    const Jobs = await Job.findAll();
    console.log("Jobs:", Jobs.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error fetching Jobs:', error);
  }
}

checkJobs();
