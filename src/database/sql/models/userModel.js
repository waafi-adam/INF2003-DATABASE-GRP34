// src/database/sql/models/userModel.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
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
  }, {
    indexes: [
      {
        unique: true,
        fields: ['Email'],
        using: 'BTREE'
      }
    ]
  });
  return User;
};
