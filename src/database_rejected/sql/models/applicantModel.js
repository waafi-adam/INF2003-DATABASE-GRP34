 // src/database_rejected/sql/models/applicantModel.js

 module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Applicant', {
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
  });
};
