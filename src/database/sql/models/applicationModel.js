// src/database/sql/models/applicationModel.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Application', {
    ApplicationID: {
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
    ApplicationDate: {
      type: DataTypes.DATE
    },
  });
};
