const sequelize = require('../db.js');
const {DataTypes, Op} = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = sequelize.define('User', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name : {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type : DataTypes.STRING,
    allowNull: false,

  }
},{allowNull: false, timestamps: false});

class userModel {
  static async registerUser(userData) {
    try{

      const { name, userName, password, role } = userData;
      const passHash = await bcrypt.hash(password, 10);
      let result = await User.create({
        name,
        userName,
        password: passHash,
        role,
      })
        return result
    }
        catch(error){
        throw error  
            }
  }
  static async loginUser(userData) {
  try {
    const { userName, password } = userData;
    const user = await User.findOne({ where: { userName } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Credenciales inválidas');
    }
    const token = jwt.sign(
      { userId: user.userId, userName: user.userName, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    return {
      user: {
        userId: user.userId,
        userName: user.userName,
        role: user.role
      },
      token,
    };
  } catch (error) {
    throw error;
  }
}
  static async getUsers(query) {
    try {
      const page = parseInt(query.page) || 1;
      const itemsPerPage = parseInt(query.itemsPerPage) || 10;
      const search = query.search || "";
      const offset = (page - 1) * itemsPerPage;
      const whereCondition = search
        ? {
            [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
          }
        : {};
      let result = await User.findAndCountAll({
        where: whereCondition,
        limit: itemsPerPage,
        offset: offset,
        attributes: { exclude: ["password"] },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = {userModel, User};