// src/database/sql/models/sessionModel.js

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Session', {
    chatId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    UserID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'UserID',
      }
    },
    IsLoggedIn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};
