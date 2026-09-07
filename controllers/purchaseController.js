const {purchaseModel} = require('../models/purchaseModel.js');
class purchaseController {
    static async getPurchases(query) {
        try {
            const purchases = await purchaseModel.getPurchases(query);
            return purchases;
        } catch (error) {
            throw new Error('Error al obtener compras: ' + error.message);
        }
     }  
     static async createPurchase(purchaseData) {
        try {
            const purchase = await purchaseModel.createPurchase(purchaseData);
            return purchase;
        } catch (error) {
            throw new Error('Error al crear compra: ' + error.message);
        }
     }
     static async updatePurchase(purchaseId, purchaseData) {
        try {
            const purchase = await purchaseModel.updatePurchase(purchaseId, purchaseData);
            return purchase;
        } catch (error) {
            throw new Error('Error al actualizar compra: ' + error.message);
        }
     }
     static async deletePurchase(purchaseId) {
        try {
            const purchase = await purchaseModel.deletePurchase(purchaseId);
            return purchase;
        } catch (error) {
            throw new Error('Error al eliminar compra: ' + error.message);
        }
     }
     static async createProviderPayment(paymentData) {
        try {
            const payment = await purchaseModel.createProviderPayment(paymentData);
            return payment;
        } catch (error) {
            throw new Error('Error al crear pago: ' + error.message);
        }
     }
     static async updateProviderPayment(paymentId, paymentData) {
        try {
            const payment = await purchaseModel.updateProviderPayment(paymentId, paymentData);
            return payment;
        } catch (error) {
            throw new Error('Error al actualizar pago: ' + error.message);
        }
     }
}
module.exports = purchaseController;