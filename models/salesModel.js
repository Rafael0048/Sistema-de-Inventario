const sequelize  = require('../db.js');
const {DataTypes, Op} = require('sequelize');
const {Product , Lot} = require('./productsModel.js')
const {Client} = require('./clientsModel.js')
const Sale = sequelize.define('Sale',{
    totalSale : {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date : {
        type : DataTypes.DATE,
        allowNull: false
    },
    clientId : {
        type : DataTypes.NUMBER,
        allowNull: false
    },
    saleId : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status : {
        type : DataTypes.STRING,
        allowNull : false
    }
    
},{ timestamps: false});
const SaleMovement = sequelize.define('SaleMovement',{
    saleMid : {
         type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productId : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    saleId : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    quantity : {
        type : DataTypes.INTEGER,
        allowNull : false
    },
    lotId : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    subTotal : {
        type : DataTypes.FLOAT,
        allowNull : false
    }
},{tableName:"salesmovement",timestamps: false})
const Payment = sequelize.define('Payment',{
    paymentId : {
        type: DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    saleId :{
        type : DataTypes.INTEGER,
        allowNull : false

    },
    method : {
        type : DataTypes.STRING,
        allowNull : false
    },
    dolarValue : {
        type : DataTypes.FLOAT,
        allowNull : false
    },
    bsValue : {
        type : DataTypes.FLOAT,
        allowNull : false
    },
    status : {
        type : DataTypes.STRING,
        allowNull: false
    },
    date : {
        type : DataTypes.DATE,
        allowNull : false
    }
},{timestamps: false})
Sale.hasMany(SaleMovement, { foreignKey: 'saleId', as: 'productosAsociados' });
SaleMovement.belongsTo(Sale, { foreignKey: 'saleId' });
SaleMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(SaleMovement, { foreignKey: 'productId' });
Sale.belongsTo(Client, { foreignKey: 'clientId', as: 'client' });
Client.hasMany(Sale, { foreignKey: 'clientId', as: 'sales' });
SaleMovement.belongsTo(Lot, { foreignKey: 'lotId', as: 'lot' });
Lot.hasMany(SaleMovement, { foreignKey: 'lotId' });
Sale.hasMany(Payment, { foreignKey: 'saleId', as: 'payments' });
Payment.belongsTo(Sale, { foreignKey: 'saleId', as: 'sale' });

class salesModel{
    static async getSales(saleId, query){
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

            if(saleId){
                Sale.findByPk(saleId).then(sale => {
                    resolve(sale);
                }).catch(err => {
                    reject(err);
                });
            } else {
                Sale.findAndCountAll({
                where: whereCondition,
                limit: itemsPerPage,
                distinct: true,
                offset: offset,
                include :[{
                    model : SaleMovement,
                    as : 'productosAsociados',
                    include : [{
                        model : Product,
                        as : 'product'
                    },
                    {
                        model : Lot,
                        as : 'lot'
                    }
                    ]
                   
                },{
                    model : Client,
                    as : 'client'
                   },{
                    model : Payment,
                    as : 'payments'
                   }
                ],
                order: [['saleId', 'DESC']] 
                }).then(sales => {
                    resolve(sales);
                }).catch(err => {
                    console.log(err);
                    reject(err);
                });
            }
        });
    }

    static createSale(saleData) {
    return new Promise((resolve, reject) => {
        // 1. Crear el registro general de la venta
        const saleInfo = {
            date: saleData.date,
            totalSale: saleData.totalSale,
            clientId: saleData.clientId
        };
        const paymentInfo = {
            dolarValue : saleData.dolarValue,
            bsValue : saleData.bsValue,
            method : saleData.method,
            status : saleData.status,
            date : saleData.date
        }
        if(paymentInfo.dolarValue >= saleInfo.totalSale && paymentInfo.status === 'Confirmado'){
            saleInfo.status = 'Pagado'
        }else{
            saleInfo.status = 'Pendiente'
        }
        
        Sale.create(saleInfo)
        .then(sale => {
            if (!saleData.items || saleData.items.length === 0) {
                return resolve(sale);
            }
            paymentInfo.saleId = sale.saleId
                Payment.create(paymentInfo).catch(err =>{reject(err)})
                const itemPromises = saleData.items.map(item => {
                    return new Promise((resolveItem, rejectItem) => {
                        
                        Lot.findAll({
                            where: {
                                productId: item.productId,
                                status: 'Disponible',
                                actualQuantity: { [Op.gt]: 0 } // Solamente lotes con stock > 0
                            },
                            order: [
                                ['date', 'ASC'],
                                ['lotId', 'ASC']
                            ]
                        }).then(lotes => {
                            // Validar stock total acumulado entre todos los lotes
                            const totalStockDisponible = lotes.reduce((acc, l) => acc + l.actualQuantity, 0);
                            
                            if (totalStockDisponible < item.quantity) {
                                return rejectItem(new Error(`Stock insuficiente para el producto ID ${item.productId}. Requerido: ${item.quantity}, Disponible: ${totalStockDisponible}`));
                            }

                            let cantidadPendiente = item.quantity;
                            const movementPromises = [];

                            // Consumo encadenado de lotes
                            for (const lote of lotes) {
                                if (cantidadPendiente <= 0) break;

                                // Determinar cuánto le restaremos a este lote específico
                                const cantidadAExtraer = Math.min(lote.actualQuantity, cantidadPendiente);
                                const nuevaCantidadLote = lote.actualQuantity - cantidadAExtraer;
                                const nuevoEstado = nuevaCantidadLote === 0 ? 'Vendido' : 'Disponible';

                                // Actualizamos la cantidad y el estado del lote
                                const updateLotePromise = lote.update({
                                    actualQuantity: nuevaCantidadLote,
                                    status: nuevoEstado
                                }).then(() => {
                                    // Creamos la línea de movimiento asociada al lote consumido
                                    return SaleMovement.create({
                                        saleId: sale.saleId,
                                        productId: item.productId,
                                        lotId: lote.lotId,
                                        quantity: cantidadAExtraer,
                                        subTotal: cantidadAExtraer * item.price // O el subtotal correspondiente a este lote
                                    });
                                });

                                movementPromises.push(updateLotePromise);
                                cantidadPendiente -= cantidadAExtraer;
                            }

                            // Esperamos a que se actualicen todos los lotes y se creen los movimientos de este producto
                            Promise.all(movementPromises)
                                .then(() => resolveItem())
                                .catch(err => rejectItem(err));

                        }).catch(err => rejectItem(err));
                    });
                });

                // Esperamos a que todos los productos de la venta procesen su FIFO
                return Promise.all(itemPromises)
                    .then(() => resolve(sale));
            })
            .catch(err => {
                reject(err);
            });
    });
}

     static async updateSale(saleId, saleData){
        return new Promise((resolve, reject) => {
            Sale.update(saleData, {where: {saleId}}).then(sale => {
                resolve(sale);
            }).catch(err => {
                reject(err);
            });
     })
    }
    static async deleteSale(saleId){
        return new Promise((resolve, reject) => {
            Sale.destroy({where: {saleId}}).then(sale => {
                resolve(sale);
            }).catch(err => {
                reject(err);
            });
        });
     }
}
module.exports = salesModel;