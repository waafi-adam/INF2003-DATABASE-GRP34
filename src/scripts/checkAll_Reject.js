// src/scripts/checkAll.js
require('dotenv').config();
const { connectDB_rejected } = require('../database_rejected'); 

const checkModel = async(modelName, Model) => {
  try {
    const model = await Model.findAll();
    console.log(`${modelName}:`, model.map(u => u.toJSON()));
  } catch (error) {
    console.error(`Error fetching ${modelName}:`, error);
  }
}

const checkResume = async(Resume) => {
  try {
    // Fetch all resumes
    const resumes = await Resume.find({});
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
}

const checkAll = async()=>{
  db = await connectDB_rejected(process.env.MONGO_URI_REJECT);

  Object.keys(db).forEach(modelName => {
    if (modelName !== "Resume" && modelName !== "mongoose") checkModel(modelName, db[modelName]);
    else if (modelName !== "mongoose") checkResume(db[modelName]);
  });
}  
checkAll();