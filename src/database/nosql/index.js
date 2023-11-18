// src/database/nosql/index.js

const mongoose = require('mongoose');
require('dotenv').config();

const uri = "mongodb+srv://inf2003-database-grp34:db123@jobifytelebot.atvq7re.mongodb.net/JobifyTelebot?retryWrites=true&w=majority"
mongoose.connect(/*process.env.MONGO_URI*/ uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  connectTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000   // 45 seconds
})
.then(() => console.log('Connected to MongoDB.'))
.catch(err => console.error('Could not connect to MongoDB.', err));

const db = {};

db.mongoose = mongoose;
db.Resume = require('./schemas/resumeSchema');


module.exports = db;
