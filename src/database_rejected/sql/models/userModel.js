// src/database_rejected/sql/models/userModel.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    UserID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    Password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    UserRole: {
      type: DataTypes.ENUM('Applicant', 'Company'),
      allowNull: false
    },
  });
};
