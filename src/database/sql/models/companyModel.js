// src/database/sql/models/companyModel.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Company', {
    CompanyID: {
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
    CompanyName: {
      type: DataTypes.STRING
    },
    Address: {
      type: DataTypes.TEXT
    },
  });
};
