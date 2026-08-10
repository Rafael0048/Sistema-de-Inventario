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

        return new Promise((resolve, reject) => {
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
                 Product.findAndCountAll({
                where: whereCondition,
                limit: itemsPerPage,
                offset: offset,
                include: [{
                        model: Lot,
                        as: 'lot'
                    }],
                order: [['productId', 'DESC']] // Orden por defecto
                })
               .then(products => {
                    resolve(products);
                }).catch(err => {
                    console.log(err)
                    reject(err);
                });
            }
          
        })
    }
    static async getLot(productId){
        return new Promise((resolve, reject)=>{
            Product.findByPk(productId, {
                    include: [{
                        model: Lot,
                        as: 'lot'
                    }]
                }).then(products => {
                    resolve(products.lot);
                }).catch(err => {
                    reject(err);
                });
        })
    }
    static async addStock(stockData) {
        return new Promise((resolve, reject) => {
            const { initialQuantity,actualQuantity, price, date, productId } = stockData;
            Lot.create({ productId, initialQuantity, price, date,actualQuantity }).then(result => {
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
module.exports = {productsModels, Product, Lot} ;