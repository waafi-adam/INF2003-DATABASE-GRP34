// src/database/index.js
const {connectNoSql} = require("./nosql");
const {connectSql} = require("./sql")


const connectDB = async(uri) =>{
    const noSqlDB = await connectNoSql(uri);
    const sqlDB = await connectSql();
    return { ...sqlDB, ...noSqlDB}
}

module.exports = {connectDB};