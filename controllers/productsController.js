let productsModels = require('../models/productsModel.js');

class productsController {
   static async getProducts(productId, query) {
        const products = await productsModels.getProducts(productId, query);
        if (products) {
            return products;
        } else {
            throw new Error('No se encontraron productos');
        }
    }
    static async addStock(productId, stockData) {
        let result = await productsModels.addStock(productId, stockData);
        if (result) {
            return result;
        } else {
            throw new Error('Error agregando lotes');
        }
    }
    static async addProduct(productData) {
        let result = await productsModels.addProduct(productData);
        if (result) {
            return result;
        } else {
            throw new Error('Error agregando productos');
        }
    }
    static async modifyProduct(productId, productData) {
        let result = await productsModels.modifyProduct(productId, productData);
        if (result) {
            return result;
        } else {
            throw new Error('Error modifucando producto');
        }
    }
    static async deleteProduct(productId) {
        let result = await productsModels.deleteProduct(productId);
        if (result) {
            return result;
        } else {
            throw new Error('Error eliminando producto');
        }
    }
    static async getLot(productId){
        let result = await productsModels.getLot(productId)
        if(result){
            return result
        }else{
            throw new Error('Error obteniendo los lotes')
        }
    }
    static async modifyStock(lotId, stockData) {
        let result = await productsModels.modifyStock(lotId, stockData);
        if (result) {
            return result;
        } else {
            throw new Error('Error modificando los lotes');
        }
    }
    static async deleteStock(lotId) {
        let result = await productsModels.deleteStock(lotId);
        if (result) {
            return result;
        } else {
            throw new Error('Error eliminando el lote');
        }
    }
}

module.exports = productsController;