const sequelize = require('../db.js');
const {DataTypes} = require('sequelize');
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
  }
},{allowNull: false, timestamps: false});

class userModel{
  static async registerUser(userData){
    return new Promise(async (resolve, reject) => {

      const {name, userName, password} = userData;
      const passHash = await bcrypt.hash(password, 10);
      let result = await User.create({name, userName, password: passHash}).then((result)=>{
        resolve(result);
      }).catch((err)=>{
        reject(new Error(err));
      })
    })

    }
    static async loginUser(userData){
      return new Promise(async (resolve, reject) => {
        const {userName, password} = userData;
        let result = await User.findOne({where: {userName}}).then(async (result)=>{
          if(result){
            const isMatch = await bcrypt.compare(password, result.password);
            if(isMatch){
              const token = jwt.sign({userId: result.userId, userName: result.userName}, process.env.JWT_SECRET, {expiresIn: '1h'});
              resolve({user: result.userNamea, token});
            } else {
              reject(new Error('Credenciales invalidas'));
            }
          } else {
            reject(new Error('Usuario no encontrado'));
          }
        }).catch((err)=>{
          reject(new Error(err));
        })
      })
    }
}

module.exports = userModel;