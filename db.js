const { Sequelize } = require('sequelize');
require('dotenv').config();
const sequelize = new Sequelize(process.env.Db_NAME, process.env.Db_USER, process.env.Db_PASSWORD, {
  host: process.env.Db_HOST,
  dialect: 'mysql',
  logging: false,
});

module.exports = sequelize;