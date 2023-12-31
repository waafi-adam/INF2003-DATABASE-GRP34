// src/database/sql/models/sessionModel.js
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define('Session', {
    SessionID: {
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
  return Session;
};
