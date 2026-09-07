const {providerModel} = require('../models/providerModel.js');
class providerController {
    static async getProvider(providerId, query) {
        try {
            const provider = await providerModel.getProvider(providerId, query);
            return provider;
        } catch (error) {
            throw new Error('Error al obtener clientes: ' + error.message);
        }
     }
     static async createProvider(providerData) {
        try {
            const provider = await providerModel.createProvider(providerData);
            return provider;
        } catch (error) {
            throw new Error('Error al crear proveedor: ' + error.message);
        }
     }
     static async updateProvider(providerId, providerData) {
        try {
            const provider = await providerModel.updateProvider(providerId, providerData);
            return provider;
        } catch (error) {
            throw new Error('Error al actualizar proveedor: ' + error.message);
        }
     }
     static async deleteProvider(providerId) {
        try {
            const provider = await providerModel.deleteProvider(providerId);
            return provider;
        } catch (error) {
            throw new Error('Error al eliminar proveedor: ' + error.message);
        }
     }
}
module.exports = providerController;