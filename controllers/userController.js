const {userModel} = require('../models/userModel');
class userController{
    static async registerUser(userData){
        try{
            let result = await userModel.registerUser(userData);
                return result;
        }catch(error){
            throw new Error(error);
        }
            
         
    
    }
    static async loginUser(userData){
        try{
            let result = await userModel.loginUser(userData);
                return result;
        }
        catch(error){
            throw error;
        }
        
    }
    static async getUsers(query){
        try{

            let result = await userModel.getUsers(query)
            return result
        }
        catch(error){
            throw error;
        }
    }
    
 }
module.exports = userController;