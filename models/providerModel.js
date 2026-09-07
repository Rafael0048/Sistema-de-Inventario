const sequelize  = require('../db.js');
const {DataTypes, Op} = require('sequelize');
const Provider = sequelize.define('Provider',{
    name : {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    phone : {
        type : DataTypes.STRING,

    },
    providerId : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    direction : {
        type: DataTypes.STRING,
        allowNull: false
    }

},{allowNull: false, timestamps: false});

class providerModel{
    static async getProvider(providerId, query){
        try{
            const { Purchase, ProviderPayment,PurchaseMovement } = sequelize.models;
            const page = parseInt(query.page) || 1;
            const itemsPerPage = parseInt(query.itemsPerPage) || 10;
            const search = query.search || '';
            const whereCondition = search? {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
          ]
        }
      : {};
            const offset = (page - 1) * itemsPerPage;

              const result = await  Provider.findAndCountAll({
                where: whereCondition,
                limit: itemsPerPage,
                offset: offset,
                include : [{
                    model: Purchase,
                    as: 'purchases'
                }],
                order: [['providerId', 'DESC']] 
                })
            return result
        }catch(error){
            console.log(error)
            throw error
        }
            
    }
    static async createProvider(providerData){
        try{
            const result = await Provider.create(providerData);
            return result;
        }catch(error){
            throw error;
        }
    }
        
     static async updateProvider(providerId, providerData){
        try{
            const result = await Provider.update(providerData, {where: {providerId  }});
            return result;
        }catch(error){
            throw error;
        }
    }
    static async deletProvider(providerId){
        try{
            const result = await Provider.destroy({where: {providerId}});
            return result;
        }catch(error){
            throw error;
        }
     }
}
module.exports = {providerModel, Provider};
           
