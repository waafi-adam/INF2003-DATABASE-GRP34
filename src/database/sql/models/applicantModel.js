// src/database/sql/models/applicantModel.js
module.exports = (sequelize, DataTypes) => {
  const Applicant = sequelize.define('Applicant', {
    ApplicantID: {
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
    Name: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['UserID'],
        using: 'BTREE'
      },
      {
        fields: ['Name'],
        using: 'BTREE'
      }
    ]
  });

  return Applicant;
};
