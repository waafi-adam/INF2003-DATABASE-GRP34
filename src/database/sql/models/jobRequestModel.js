// src/database/sql/models/jobRequestModel.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('JobRequest', {
    RequestID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'UserID',
      }
    },
    JobID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Jobs',
        key: 'JobID',
      }
    },
    RequestDate: {
      type: DataTypes.DATE
    },
  });
};
