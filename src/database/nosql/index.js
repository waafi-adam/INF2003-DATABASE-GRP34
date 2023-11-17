const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB.'))
.catch((err) => console.error('Could not connect to MongoDB.', err));

const db = {};

db.mongoose = mongoose;
db.Resume = require('./schemas/resumeSchema');
db.JobDescription = require('./schemas/jobDescriptionSchema');


module.exports = db;
