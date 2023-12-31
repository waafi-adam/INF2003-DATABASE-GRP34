// src/database/sql/models/jobModel.js
module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
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
      type: DataTypes.TEXT
    },
  }, {
    indexes: [
      {
        fields: ['CompanyID'],
        using: 'BTREE'
      },
      {
        fields: ['JobTitle'],
        using: 'BTREE'
      }
    ]
  });
  return Job;
};
