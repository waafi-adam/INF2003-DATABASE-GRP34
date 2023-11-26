// src\scripts\testTimeNonIndexed.js
require('dotenv').config();
const { connectDB_rejected } = require('../database_rejected');

async function matchJobsLogic(userId, db) {
    console.time('matchJobsExecutionTime'); // Start timing the execution

    const user = await db.User.findByPk(userId);
    if (!user || user.UserRole !== 'Applicant') {
        console.error("The user is not an applicant or doesn't exist.");
        return;
    }

    const applicant = await db.Applicant.findOne({ where: { UserID: user.UserID } });
    const applicantSkills = await db.ApplicantSkill.findAll({ where: { ApplicantID: applicant.ApplicantID } });
    const skillNames = applicantSkills.map(skill => skill.SkillName);

    const matchingJobs = await db.Job.findAll({
        include: [{
            model: db.JobSkill,
            where: { SkillName: skillNames }
        }]
    });
    console.log("Non Indexed Tables:")
    console.timeEnd('matchJobsExecutionTime'); // End timing the execution

    // matchingJobs.forEach(job => {
    //     console.log(`Job Title: ${job.JobTitle}, Job Description: ${job.JobDescription}`);
    // });
}

async function testTime() {
  const nonIndexed_db = await connectDB_rejected(process.env.MONGO_URI);
  try {
    // You would replace 'someUserId' with the actual user ID
    await matchJobsLogic('166', nonIndexed_db);
  } catch (err) {
    console.error('An error occurred during the test:', err);
  } finally {
    if (nonIndexed_db) {
      // Assuming you have a method to close the connection
      nonIndexed_db.mongoose.connection.close();    
    }
  }
}

testTime();
