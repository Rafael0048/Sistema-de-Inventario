const userModel = require('../models/userModel');
class userController{
    static async registerUser(userData){
            let result = await userModel.registerUser(userData);
            if(result){
                return result;
        }else{
                throw new Error('Error registrando usuario');
         }
    
    }
    static async loginUser(userData){
        let result = await userModel.loginUser(userData);
        if(result){
            return result;
        }else{
            throw new Error('Error iniciando sesión');
        }
    }
 }
module.exports = userController;