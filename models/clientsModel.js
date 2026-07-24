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
        return new Promise((resolve, reject) => {
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

            if(clientId){
                Client.findByPk(clientId).then(client => {
                    resolve(client);
                }).catch(err => {
                    reject(err);
                });
            } else {
                Client.findAndCountAll({
                where: whereCondition,
                limit: itemsPerPage,
                offset: offset,
                order: [['clientId', 'DESC']] 
                }).then(clients => {
                    resolve(clients);
                }).catch(err => {
                    console.log(err);
                    reject(err);
                });
            }
        });
    }
    static async createClient(clientData){
        return new Promise((resolve, reject) => {
            Client.create(clientData).then(client => {
                resolve(client);
            }).catch(err => {
                reject(err);
            });
        });
     }
     static async updateClient(clientId, clientData){
        return new Promise((resolve, reject) => {
            Client.update(clientData, {where: {clientId}}).then(client => {
                resolve(client);
            }).catch(err => {
                reject(err);
            });
     })
    }
    static async deleteClient(clientId){
        return new Promise((resolve, reject) => {
            Client.destroy({where: {clientId}}).then(client => {
                resolve(client);
            }).catch(err => {
                reject(err);
            });
        });
     }
}
module.exports = clientsModel;