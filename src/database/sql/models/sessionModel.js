// src/database/sql/models/sessionModel.js

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Session', {
      UserID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'UserID',
        }
      },
      IsLoggedIn: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      chatId: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
    });
  };
  