const sequelize  = require('../db.js');
const {DataTypes, Op} = require('sequelize');
const Client = sequelize.define('Client',{
    name : {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName : {
        type : DataTypes.STRING,
        allowNull: false
    },
    phone : {
        type : DataTypes.NUMBER,

    },
    clientId : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    identification : {
        type: DataTypes.STRING,
        allowNull: false
    }
},{allowNull: false, timestamps: false});

class clientsModel{
    static async getClients(clientId, query){
        try{

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

              const result = await  Client.findAndCountAll({
                where: whereCondition,
                limit: itemsPerPage,
                offset: offset,
                order: [['clientId', 'DESC']] 
                })
            return result
        }catch(error){
            throw error
        }
            
    }
    static async createClient(clientData){
        try{
            const result = await Client.create(clientData);
            return result;
        }catch(error){
            throw error;
        }
    }
        
     static async updateClient(clientId, clientData){
        try{
            const result = await Client.update(clientData, {where: {clientId}});
            return result;
        }catch(error){
            throw error;
        }
    }
    static async deleteClient(clientId){
        try{
            const result = await Client.destroy({where: {clientId}});
            return result;
        }catch(error){
            throw error;
        }
     }
}
module.exports = {clientsModel, Client};
           
