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

            
                const result = await Sale.findAndCountAll({
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
                })
                return result
        }catch(error){
            throw error
        }
            
    }

    static async createSale(saleData) {
  const transaction = await sequelize.transaction();

  try {
    const status = (saleData.dolarValue >= saleData.totalSale && saleData.status === 'Confirmado')
      ? 'Pagado'
      : 'Pendiente';

    const sale = await Sale.create({
      date: saleData.date,
      totalSale: saleData.totalSale,
      clientId: saleData.clientId,
      status: status
    }, { transaction });

    await Payment.create({
      saleId: sale.saleId,
      dolarValue: saleData.dolarValue,
      bsValue: saleData.bsValue,
      method: saleData.method,
      status: saleData.status,
      date: saleData.date
    }, { transaction });

    if (!saleData.items || saleData.items.length === 0) {
      await transaction.commit();
      return sale;
    }

    for (const item of saleData.items) {
      const lotes = await Lot.findAll({
        where: {
          productId: item.productId,
          status: 'Disponible',
          actualQuantity: { [Op.gt]: 0 }
        },
        order: [
          ['date', 'ASC'],
          ['lotId', 'ASC']
        ],
        transaction
      });

      const totalStockDisponible = lotes.reduce((acc, l) => acc + l.actualQuantity, 0);

      if (totalStockDisponible < item.quantity) {
        throw new Error(
          `Stock insuficiente para el producto ID ${item.productId}. Requerido: ${item.quantity}, Disponible: ${totalStockDisponible}`
        );
      }

      let cantidadPendiente = item.quantity;

      for (const lote of lotes) {
        if (cantidadPendiente <= 0) break;

        const cantidadAExtraer = Math.min(lote.actualQuantity, cantidadPendiente);
        const nuevaCantidadLote = lote.actualQuantity - cantidadAExtraer;
        const nuevoEstado = nuevaCantidadLote === 0 ? 'Vendido' : 'Disponible';

        await lote.update({
          actualQuantity: nuevaCantidadLote,
          status: nuevoEstado
        }, { transaction });

        await SaleMovement.create({
          saleId: sale.saleId,
          productId: item.productId,
          lotId: lote.lotId,
          quantity: cantidadAExtraer,
          subTotal: cantidadAExtraer * item.price
        }, { transaction });

        cantidadPendiente -= cantidadAExtraer;
      }
    }

    await transaction.commit();
    return sale;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

     static async updateSale(saleId, saleData){
        try{

           const result = await Sale.update(saleData, {where: {saleId}})
           return result
        }catch(error){
            throw error
        }
            
     
    }
    static async deleteSale(saleId){
        try{
            const result = await Sale.destroy({where: {saleId}})
            return result
        }catch(error){
            throw error
        }
     }
     static async createPayment(paymentData) {
    try {
        const payment = await Payment.create(paymentData);

        const sale = await Sale.findByPk(paymentData.saleId);

        if (sale) {
            const totalPaid = await Payment.sum('dolarValue', {
                where: {
                    saleId: paymentData.saleId,
                    status: 'Confirmado'
                }
            }) || 0;

            if (totalPaid >= Number(sale.totalSale)) {
                await sale.update({ status: 'Pagado' });
            } else if (totalPaid > 0) {
                await sale.update({ status: 'Pendiente' });
            }
        }

        return payment;
    } catch (error) {
        throw error;
    }
}
    static async updatePayment(paymentId, paymentData) {
    try {
        console.log(paymentId, paymentData)
        const payment = await Payment.findByPk(paymentId);
        if (!payment) {
            throw new Error('Pago no encontrado');
        }

        await payment.update(paymentData);

        const sale = await Sale.findByPk(payment.saleId);

        if (sale) {
            const totalPaid = await Payment.sum('dolarValue', {
                where: {
                    saleId: payment.saleId,
                    status: 'Confirmado'
                }
            }) || 0;

            let newStatus = 'Pendiente';
            if (totalPaid >= Number(sale.totalSale)) {
                newStatus = 'Pagado';
            } 
            await sale.update({ status: newStatus });
        }

        return payment;
    } catch (error) {
        throw error;
    }
 }
}
module.exports = salesModel;