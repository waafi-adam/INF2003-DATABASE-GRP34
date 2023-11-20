// src/database/sql/models/jobSkillModel.js

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('JobSkill', {
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
      }
    });
  };
  