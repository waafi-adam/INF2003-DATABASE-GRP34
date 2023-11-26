// src/database/sql/models/companyModel.js
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    static async findByUserId(userId) {
      return this.findOne({
        where: { UserID: userId },
      });
    }
  }
  Company.init({
    CompanyID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    UserID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'UserID',
      },
    },
    CompanyName: {
      type: DataTypes.STRING,
    },
    Address: {
      type: DataTypes.TEXT,
    },
  }, {
    sequelize,
    modelName: 'Company',
    indexes: [
      {
        fields: ['UserID'],
        using: 'BTREE'
      },
      {
        fields: ['CompanyName'],
        using: 'BTREE'
      }
    ]
  });
  return Company;
};