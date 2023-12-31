// src/database/sql/models/applicantSkillModel.js
module.exports = (sequelize, DataTypes) => {
  const ApplicantSkill = sequelize.define('ApplicantSkill', {
    ApplicantSkillID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ApplicantID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Applicants',
        key: 'ApplicantID',
      }
    },
    SkillName: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    indexes: [
      {
        fields: ['ApplicantID'],
        using: 'BTREE'
      },
      {
        fields: ['SkillName'],
        using: 'BTREE'
      }
    ]
  });

  return ApplicantSkill;
};