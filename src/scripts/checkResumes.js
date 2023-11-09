// src/scripts/checkResumes.js
require('dotenv').config();
const db = require('../database/nosql'); // Update with the correct path to your database directory

(async () => {
  try {
    // Wait for the connection to MongoDB to be established
    await db.mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB.');

    // Fetch all resumes
    const resumes = await db.Resume.find({});
    console.log(`Total resumes found: ${resumes.length}`);
    resumes.forEach(resume => {
      console.log(`Resume ID: ${resume._id}, User ID: ${resume.userID}`);
    });

    // Disconnect from MongoDB
    await db.mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (err) {
    console.error('Could not connect to MongoDB.', err);
  }
})();
