// src/database/nosql/schemas/jobDescriptionSchema.js
const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  JobID: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  ExtendedJobDescription: { type: String, required: true },
});

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);