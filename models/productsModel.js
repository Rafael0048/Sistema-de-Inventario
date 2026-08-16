const { DataTypes, Op } = require('sequelize');
const sequelize =  require('../db.js')
const Product = sequelize.define('Product', {
    productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    width: {
        type: DataTypes.STRING  ,
        allowNull: false 
    },
    height: {
        type: DataTypes.STRING,
        allowNull: false 
    },
    length: {
        type: DataTypes.STRING,
        allowNull: false 
    },

},{ timestamps: false })
const Lot = sequelize.define('Lot', {
     lotId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  date: DataTypes.DATEONLY,
  actualQuantity: { type: DataTypes.INTEGER, allowNull: false },
    initialQuantity: { type: DataTypes.INTEGER, allowNull: false },
    status : {type : DataTypes.STRING}
    
}, { timestamps: false ,tableName: 'lot'});

Product.hasMany(Lot, { foreignKey: 'productId', as: 'lot' });
Lot.belongsTo(Product, { foreignKey: 'productId' });

class productsModels{
    static async getProducts(productId, query){
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
       const result = await Product.findAndCountAll({
       where: whereCondition,
       limit: itemsPerPage,
       offset: offset,
       include: [{
               model: Lot,
               as: 'lot'
           }],
       order: [['productId', 'DESC']] 
       })
      return result
   }

        catch(error){
            throw error
        }
           
          
    }
    static async getLot(productId){
        try{
            const result = await Lot.findAll({
                    where : { productId }
                })
                return result
        }catch(error){
            throw error
        }
           
    }
    static async addStock(stockData) {
        try{
            const { initialQuantity,actualQuantity, price, date, productId } = stockData;
          const result = await  Lot.create({ productId, initialQuantity, price, date,actualQuantity })
          return result
        } catch(error){
            throw error
        }
    }
    static async addProduct(productData) {
        try{
            const { name, width, height, length, price, date, quantity  } = productData;
            const result = await Product.create({ name, width, height, length });
            if(price && quantity && date) {
                await productsModels.addStock(result.productId, { price, quantity, date });
            }
            return result;
        } catch(error){
            throw error;
        }
    }
    static async modifyProduct(productId, productData){
        try{
            const { name, width, height, length } = productData;
            const result = await Product.update({ name, width, height, length }, { where: { productId } });
            return result;
        }catch(error){
            throw error
        }
        
    }
    static async modifyProduct(productId, productData){
        try{

            const { name, width, height, length } = productData;
           const result = await Product.update({ name, width, height, length }, { where: { productId } })
           return result
        }catch(error){
            throw error
        }
        
    }
    static async deleteProduct(productId){
        try{

            const result = await Product.destroy({ where: { productId } })
            return result;
        }catch(error){
            throw error
        }
            
     }
     static async modifyStock(lotId, stockData) {
        try{
            const { quantity, price, date } = stockData;
            const result = await Lot.update({ quantity, price, date }, { where: { lotId } });
            return result;
        }catch(error){
            throw error;
        }
     }
     static async deleteStock(lotId) {
        try{
            const result = await Lot.destroy({ where: { lotId } });
            return result;
        }catch(error){
            throw error;
        }
     }

     
     static async deleteStock(lotId) {
        try{
            const result = await Lot.destroy({ where: { lotId } });
            return result;
        }catch(error){
            throw error;
        }
}
 }
module.exports = {productsModels, Product, Lot} ;