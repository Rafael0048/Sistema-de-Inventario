let { productsModels } = require('../models/productsModel.js');

class productsController {
  static async getProducts(productId, query) {
    try {
      const result = await productsModels.getProducts(productId, query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async addStock(stockData) {
    try {
      const result = await productsModels.addStock(stockData);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async addProduct(productData) {
    try {
      const result = await productsModels.addProduct(productData);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async modifyProduct(productId, productData) {
    try {
      const result = await productsModels.modifyProduct(productId, productData);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteProduct(productId) {
    try {
      const result = await productsModels.deleteProduct(productId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getLot(productId) {
    try {
      const result = await productsModels.getLot(productId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async modifyStock(lotId, stockData) {
    try {
      const result = await productsModels.modifyStock(lotId, stockData);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteStock(lotId) {
    try {
      const result = await productsModels.deleteStock(lotId);
      return result;
    } catch (error) {
      throw error;
    }
  }

  
  static async getMovementsByLot(query) {
    try {
      const result = await productsModels.getMovementsByLot(query);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async createMovement(movementData) {
    try {
      const result = await productsModels.createMovement(movementData);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async adjustStock(lotId, adjustData) {
    try {
      const result = await productsModels.adjustStock(lotId, adjustData);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = productsController;