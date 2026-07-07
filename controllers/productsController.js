let productsModels = require('../models/productsModel.js');

class productsController {
   static async getProducts(productId) {
        const products = await productsModels.getProducts(productId);
        if (products) {
            return products;
        } else {
            throw new Error('No products found');
        }
    }
    static async addStock(productId, stockData) {
        let result = await productsModels.addStock(productId, stockData);
        if (result) {
            return result;
        } else {
            throw new Error('Error adding stock');
        }
    }
    static async addProduct(productData) {
        let result = await productsModels.addProduct(productData);
        if (result) {
            return result;
        } else {
            throw new Error('Error adding product');
        }
    }
    static async modifyProduct(productId, productData) {
        let result = await productsModels.modifyProduct(productId, productData);
        if (result) {
            return result;
        } else {
            throw new Error('Error modifying product');
        }
    }
    static async deleteProduct(productId) {
        let result = await productsModels.deleteProduct(productId);
        if (result) {
            return result;
        } else {
            throw new Error('Error deleting product');
        }
    }
    static async modifyStock(lotId, stockData) {
        let result = await productsModels.modifyStock(lotId, stockData);
        if (result) {
            return result;
        } else {
            throw new Error('Error modifying stock');
        }
    }
    static async deleteStock(lotId) {
        let result = await productsModels.deleteStock(lotId);
        if (result) {
            return result;
        } else {
            throw new Error('Error deleting stock');
        }
    }
}

module.exports = productsController;