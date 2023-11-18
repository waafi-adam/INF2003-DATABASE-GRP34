// src/scripts/checkResumes.js
require('dotenv').config();
const db = require('../database/nosql'); // Update with the correct path to your database directory

(async () => {
  try {
    // Fetch all resumes
    const resumes = await db.Resume.find({});
    console.log(`Total resumes found: ${resumes.length}`);

    // Print each resume with all details
    resumes.forEach((resume, index) => {
      console.log(`\nResume ${index + 1}:`);
      console.log(JSON.stringify(resume, null, 2)); // Pretty print the resume
    });
  } catch (err) {
    console.error('Could not connect to MongoDB.', err);
  } finally {
    // Disconnect from MongoDB
    await db.mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
})();
