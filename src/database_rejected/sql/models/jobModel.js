// src/database_rejected/sql/models/jobModel.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Job', {
    JobID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    CompanyID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Companies',
        key: 'CompanyID',
      }
    },
    JobTitle: {
      type: DataTypes.STRING
    },
    JobDescription: {
      type: DataTypes.STRING
    },
  });
};