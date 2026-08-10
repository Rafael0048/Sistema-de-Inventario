const salesModel = require('../models/salesModel.js');
class salesController {
    static async getSales(saleId, query) {
        try {
            const sales = await salesModel.getSales(saleId, query);
            return sales;
        } catch (error) {
            throw new Error('Error al obtener ventas: ' + error.message);
        }
     }
     static async createSale(saleData) {
        try {
            const sale = await salesModel.createSale(saleData);
            return sale;
        } catch (error) {
            throw new Error('Error al crear venta: ' + error.message);
        }
     }
     static async updateSale(saleId, saleData) {
        try {
            const sale = await salesModel.updateSale(saleId, saleData);
            return sale;
        } catch (error) {
            throw new Error('Error al actualizar venta: ' + error.message);
        }
     }
     static async deleteSale(saleId) {
        try {
            const sale = await salesModel.deleteSale(saleId);
            return sale;
        } catch (error) {
            throw new Error('Error al eliminar venta: ' + error.message);
        }
     }
}
module.exports = salesController;