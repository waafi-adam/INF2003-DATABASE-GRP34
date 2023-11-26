// src/database_rejected/nosql/index.js
const mongoose = require('mongoose');

const connectNoSql = async (uri) => {
  const maxRetries = 5; // Maximum number of retries
  let currentAttempt = 0;

  while (currentAttempt < maxRetries) {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        connectTimeoutMS: 3000, // 3 seconds
        socketTimeoutMS: 5000   // 5 seconds
      });
      console.log('Connected to MongoDB.');
      const noSqlDB = {
        mongoose: mongoose,
        Resume: require('./schemas/resumeSchema')
      };
      return noSqlDB;
    } catch (err) {
      currentAttempt++;
      console.error(`Attempt ${currentAttempt}: Could not connect to MongoDB. Retrying in 5 seconds...`, err);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds
    }
  }

  throw new Error('Failed to connect to MongoDB after several attempts.');
};

module.exports = { connectNoSql };
