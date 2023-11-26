// src/database/sql/models/skillModel.js
module.exports = (sequelize, DataTypes) => {
  const Skill = sequelize.define('Skill', {
    SkillID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    SkillName: {
      type: DataTypes.STRING
    },
  }, {
    indexes: [
      {
        fields: ['SkillName'],
        using: 'BTREE'
      }
    ]
  });
  return Skill;
};