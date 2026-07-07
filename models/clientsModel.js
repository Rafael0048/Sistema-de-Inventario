const sequelize  = require('../db.js');
const {DataTypes} = require('sequelize');
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
    static async getClients(clientId){
        return new Promise((resolve, reject) => {
            if(clientId){
                Client.findByPk(clientId).then(client => {
                    resolve(client);
                }).catch(err => {
                    reject(err);
                });
            } else {
                Client.findAll().then(clients => {
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