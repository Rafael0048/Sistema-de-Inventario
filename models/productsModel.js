const { DataTypes } = require('sequelize');
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
  quantity: { type: DataTypes.INTEGER, allowNull: false }
}, { timestamps: false ,tableName: 'lot'});

Product.hasMany(Lot, { foreignKey: 'productId', as: 'lot' });
Lot.belongsTo(Product, { foreignKey: 'productId' });

class productsModels{
    static async getProducts(productId){

        return new Promise((resolve, reject) => {
            if(productId){
                Product.findByPk(productId, {
                    include: [{
                        model: Lot,
                        as: 'lot'
                    }]
                }).then(product => {
                    resolve(product);
                }).catch(err => {
                    reject(err);
                });
            } else {
                Product.findAll({
                    include: [{
                        model: Lot,
                        as: 'lot'
                    }]
                }).then(products => {
                    resolve(products);
                }).catch(err => {
                    reject(err);
                });
            }
          
        })
    }
    static async addStock(productId, stockData) {
        return new Promise((resolve, reject) => {
            const { quantity, price, date } = stockData;
            Lot.create({ productId, quantity, price, date }).then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        })
    }
    static async addProduct(productData) {
        return new Promise((resolve, reject) => {
            const { name, width, height, length, price, date, quantity  } = productData;
            Product.create({ name, width, height, length }).then(result => {
                if(price && quantity && date) {
                    productsModels.addStock(result.productId, { price, quantity, date })
                   resolve(result)
                }else{
                    resolve(result)}
               
                })
            })
        
    }
    static async modifyProduct(productId, productData){
        return new Promise((resolve,reject)=>{
        const { name, width, height, length } = productData;
        Product.update({ name, width, height, length }, { where: { productId } })
        .then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    })
    }
    static async deleteProduct(productId){
        return new Promise((resolve,reject)=>{
            Product.destroy({ where: { productId } })
            .then(result => {
                resolve(result);
            }).catch(err => {
                reject(err);w
            });
        })
     }
     static async modifyStock(lotId, stockData) {
        return new Promise((resolve, reject) => {
            const { quantity, price, date } = stockData;
            Lot.update({ quantity, price, date }, { where: { lotId } })
                .then(result => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
        })
     }
     static async deleteStock(lotId) {
        return new Promise((resolve, reject) => {
            Lot.destroy({ where: { lotId } })
                .then(result => {
                    resolve(result);
                }).catch(err => {
                    reject(err);
                });
        })
     }

}
module.exports = productsModels;