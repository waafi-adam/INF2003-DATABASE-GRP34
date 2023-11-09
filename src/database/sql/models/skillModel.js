// src/database/sql/models/skillModel.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Skill', {
    SkillID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    SkillName: {
      type: DataTypes.STRING
    },
  });
};
