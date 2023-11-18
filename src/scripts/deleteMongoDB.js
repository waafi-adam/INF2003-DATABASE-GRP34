// src/scripts/deleteMongoDB.js
const db = require('../database/nosql'); // Adjust the path to where your index.js is located

async function deleteAllData() {
  try {
    // Assuming your models are named 'Resume' and 'JobDescription' in the db object
    // Delete all documents from the Resume collection
    const deletedResumes = await db.Resume.deleteMany({});
    console.log(`Deleted all resumes: ${deletedResumes.deletedCount}`);

    // // Delete all documents from the JobDescription collection
    // const deletedJobDescriptions = await db.JobDescription.deleteMany({});
    // console.log(`Deleted all job descriptions: ${deletedJobDescriptions.deletedCount}`);

  } catch (err) {
    console.error('Error deleting data:', err);
  } finally {
    // Close Mongoose connection
    db.mongoose.connection.close();
  }
}

deleteAllData();
