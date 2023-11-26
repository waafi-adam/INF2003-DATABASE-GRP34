// src/scripts/deleteMongoDB.js
require('dotenv').config();
const { connectDB_rejected } = require('../database_rejected');

async function deleteAllData() {
  const db = await connectDB_rejected(process.env.MONGO_URI_REJECT);
  try {
    // Drop all indexes except for the default _id index
    await db.Resume.collection.dropIndexes();
    console.log('All indexes dropped from resumes collection.');

    // Delete all resumes
    const deletedResumes = await db.Resume.deleteMany({});
    console.log(`Deleted all resumes: ${deletedResumes.deletedCount}`);
  } catch (err) {
    console.error('Error in operation:', err);
  } finally {
    // Close Mongoose connection
    db.mongoose.connection.close();
  }
}

deleteAllData();
