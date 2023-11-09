// src/database/nosql/schemas/resumeSchema.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the SQL User table's primary key
    required: true,
    unique: true,
    ref: 'User' // Assuming you have a User model in MongoDB that corresponds to the SQL User
  },
  personalDetails: {
    name: String,
    email: String,
    // You can add other personal details here
  },
  workExperience: [{
    title: String,
    company: String,
    startDate: Date,
    endDate: Date,
    description: String,
    // Add other relevant fields
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    // Additional fields
  }],
  skills: [String], // An array of strings for various skills
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    // Other relevant fields
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
