// src/scripts/populateDB.js
const fs = require('fs');
const bcrypt = require('bcrypt');
const { parse } = require('csv-parse/sync');
const { connectDB } = require('../database');
require('dotenv').config();

(async () => {
  const { User, Applicant, Company, Job, ApplicantSkill, JobSkill, Resume } = await connectDB(process.env.MONGO_URI);

  // Function to parse CSV data
  const parseCsv = (filePath) => {
    const content = fs.readFileSync(filePath);
    return parse(content, {
      columns: true,
      skip_empty_lines: true
    });
  };

  // Helper function to convert JavaScript object notation to JSON
  function toValidJSON(str) {
    return str
      .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":') // Wrap keys without quote with double quotes
      .replace(/:\s*'([^']+)'/g, ':"$1"'); // Wrap string values with single quotes in double quotes
    }
    // Function to save applicants
    const saveApplicants = async (applicantsData) => {
      let i = 0;
      for (const data of applicantsData) {
        let user = await User.findOne({ where: { Email: data.Email } });
        const hashedPassword = await bcrypt.hash(data.Password, 10);
        if (!user) {
          user = await User.create({
            Email: data.Email,
            Password: hashedPassword,
            UserRole: 'Applicant'
          });
        }
    
        let applicant = await Applicant.findOne({ where: { UserID: user.UserID } });
        if (!applicant) {
          applicant = await Applicant.create({
            UserID: user.UserID,
            Name: data.Name
          });
        }
    
        const skills = data.Skills.split(', ');
        for (const skill of skills) {
          await ApplicantSkill.findOrCreate({
            where: { ApplicantID: applicant.ApplicantID, SkillName: skill }
          });
        }
        
        // Ensure JSON format is correct for ResumeDetails
        const validJSONString = toValidJSON(data.ResumeDetails);
        const resumeDetails = JSON.parse(validJSONString);
        
        // Check for existing resume
        const existingResume = await Resume.findOne({ applicantID: applicant.ApplicantID });
        if (existingResume) {
          // await existingResume.update({ ...resumeDetails });
          await Resume.findByIdAndUpdate(existingResume._id, { $set: resumeDetails });
        } else {
          // Only create a new resume if applicantID is not null
          if (applicant.ApplicantID) {
            const resume = new Resume({
              ...resumeDetails,
              applicantID: applicant.ApplicantID,
              skills
            })
            resume.save();
          } else {
            console.log(`Skipping resume creation for null ApplicantID: ${data.Email}`);
          }
        }
      }
  };
  

  // Function to save companies and jobs
  const saveCompanies = async (companiesData) => {
    for (const data of companiesData) {
      let user = await User.findOne({ where: { Email: data.Email } });
      let company;

      if (!user) {
        const hashedPassword = await bcrypt.hash(data.Password, 10);
        user = await User.create({
          Email: data.Email,
          Password: hashedPassword,
          UserRole: 'Company'
        });

        company = await Company.create({
          UserID: user.UserID,
          CompanyName: data.CompanyName,
          Address: data.Address
        });
      } else {
        company = await Company.findOne({ where: { UserID: user.UserID } });
      }

      const job = await Job.create({
        CompanyID: company.CompanyID,
        JobTitle: data.JobTitle,
        JobDescription: data.JobDescription
      });

      const jobSkills = data.JobSkills.split(', ');
      for (const skill of jobSkills) {
        await JobSkill.create({
          JobID: job.JobID,
          SkillName: skill
        });
      }
    }
  };

  // Read and parse the CSV files
  const applicantsData = parseCsv('./src/scripts/data-applicants.csv');
  const companiesData = parseCsv('./src/scripts/data-jobs_companies.csv');

  // Save the data to the database
  await saveApplicants(applicantsData);
  await saveCompanies(companiesData);

  console.log('Database populated successfully!');
  process.exit(0);
})();
