// src/database/sql/models/jobSkillModel.js
module.exports = (sequelize, DataTypes) => {
  const JobSkill = sequelize.define('JobSkill', {
    JobSkillID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    JobID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Jobs',
        key: 'JobID',
      }
    },
    SkillName: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    indexes: [
      {
        fields: ['JobID'],
        using: 'BTREE'
      },
      {
        fields: ['SkillName'],
        using: 'BTREE'
      }
    ]
  });
  return JobSkill;
};