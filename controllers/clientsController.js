const clientsModel = require('../models/clientsModel.js');
class clientsController {
    static async getClients(clientId) {
        try {
            const clients = await clientsModel.getClients(clientId);
            return clients;
        } catch (error) {
            throw new Error('Error al obtener clientes: ' + error.message);
        }
     }
     static async createClient(clientData) {
        try {
            const client = await clientsModel.createClient(clientData);
            return client;
        } catch (error) {
            throw new Error('Error al crear cliente: ' + error.message);
        }
     }
     static async updateClient(clientId, clientData) {
        try {
            const client = await clientsModel.updateClient(clientId, clientData);
            return client;
        } catch (error) {
            throw new Error('Error al actualizar cliente: ' + error.message);
        }
     }
     static async deleteClient(clientId) {
        try {
            const client = await clientsModel.deleteClient(clientId);
            return client;
        } catch (error) {
            throw new Error('Error al eliminar cliente: ' + error.message);
        }
     }
}
module.exports = clientsController;