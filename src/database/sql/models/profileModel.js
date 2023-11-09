// src/database/sql/models/profileModel.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ApplicantProfile', {
    UserID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'UserID',
      }
    },
    Name: { // Changed from ProfileData to Name
      type: DataTypes.STRING,
      allowNull: false
    },
  });
};
