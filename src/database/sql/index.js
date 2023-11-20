// src/database/sql/index.js

const Sequelize = require('sequelize');

const connectSql = async() =>{
  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './src/database/sql/database.sqlite',
    logging: false
  });
  const sqlDB = {};
  
  // Importing models
  sqlDB.User = require('./models/userModel')(sequelize, Sequelize.DataTypes);
  sqlDB.Applicant = require('./models/applicantModel')(sequelize, Sequelize.DataTypes);
  sqlDB.Company = require('./models/companyModel')(sequelize, Sequelize.DataTypes);
  sqlDB.Job = require('./models/jobModel')(sequelize, Sequelize.DataTypes);
  sqlDB.ApplicantSkill = require('./models/applicantSkillModel')(sequelize, Sequelize.DataTypes);
  sqlDB.JobSkill = require('./models/jobSkillModel')(sequelize, Sequelize.DataTypes);
  sqlDB.Session = require('./models/sessionModel')(sequelize, Sequelize.DataTypes);
  
  // Associations
  sqlDB.User.hasOne(sqlDB.Applicant, { foreignKey: 'UserID' });
  sqlDB.Applicant.belongsTo(sqlDB.User, { foreignKey: 'UserID' });
  
  sqlDB.User.hasMany(sqlDB.Company, { foreignKey: 'UserID' });
  sqlDB.Company.belongsTo(sqlDB.User, { foreignKey: 'UserID' });
  
  sqlDB.Company.hasMany(sqlDB.Job, { foreignKey: 'CompanyID' });
  sqlDB.Job.belongsTo(sqlDB.Company, { foreignKey: 'CompanyID' });
  
  sqlDB.Applicant.hasMany(sqlDB.ApplicantSkill, { foreignKey: 'ApplicantID' });
  sqlDB.ApplicantSkill.belongsTo(sqlDB.Applicant, { foreignKey: 'ApplicantID' });
  
  sqlDB.Job.hasMany(sqlDB.JobSkill, { foreignKey: 'JobID' });
  sqlDB.JobSkill.belongsTo(sqlDB.Job, { foreignKey: 'JobID' });
  
  // Sync tables with database
  await sequelize.sync().then(() => {
    // console.log('Database tables created!');
  });
  return sqlDB
}

module.exports = {connectSql};
