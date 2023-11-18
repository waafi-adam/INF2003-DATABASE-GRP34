// src/database/sql/index.js

const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './src/database/sql/database.sqlite', // Updated storage path
  logging: false
});

const db = {};

// Models
db.User = require('./models/userModel')(sequelize, Sequelize.DataTypes);
db.ApplicantProfile = require('./models/profileModel')(sequelize, Sequelize.DataTypes);
db.Company = require('./models/companyModel')(sequelize, Sequelize.DataTypes);
db.Job = require('./models/jobModel')(sequelize, Sequelize.DataTypes);
db.Skill = require('./models/skillModel')(sequelize, Sequelize.DataTypes);
db.Session = require('./models/sessionModel')(sequelize, Sequelize.DataTypes);


// Associations
db.User.hasOne(db.ApplicantProfile, { foreignKey: 'UserID' });
db.ApplicantProfile.belongsTo(db.User, { foreignKey: 'UserID' });

db.User.hasMany(db.Company, { foreignKey: 'UserID' });
db.Company.belongsTo(db.User, { foreignKey: 'UserID' });

db.Company.hasMany(db.Job, { foreignKey: 'CompanyID' });
db.Job.belongsTo(db.Company, { foreignKey: 'CompanyID' });


// Skills associations would be many-to-many, require a join table
db.Skill.belongsToMany(db.ApplicantProfile, { through: 'ProfileSkills', foreignKey: 'SkillID' });
db.ApplicantProfile.belongsToMany(db.Skill, { through: 'ProfileSkills', foreignKey: 'UserID' });

db.Skill.belongsToMany(db.Job, { through: 'JobSkills', foreignKey: 'SkillID' });
db.Job.belongsToMany(db.Skill, { through: 'JobSkills', foreignKey: 'JobID' });

  
  // Sync new join tables with database
  sequelize.sync().then(() => {
    console.log('Join tables created!');
  });
  

  module.exports = db;
