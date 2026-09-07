const sequelize  = require('../db.js');
const {DataTypes, Op} = require('sequelize');
const {Provider} = require('./providerModel.js')
const {Product, Lot, LotMovement} = require('./productsModel.js')

const ProviderPayment = sequelize.define('ProviderPayment',{
    providerPaymentId : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    providerId : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dolarValue : {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    bsValue : {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    method : {
        type: DataTypes.STRING,
        allowNull: false
    },
    status : {
        type: DataTypes.STRING,
        allowNull: false
    },
    date : {
        type: DataTypes.DATE,
        allowNull: false
    },
    purchaseId : {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, { timestamps: false });
const Purchase = sequelize.define('Purchase',{
    purchaseId : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    providerId : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalPurchase : {
        type: DataTypes.FLOAT,
        allowNull: false    
    },
    date : {
        type: DataTypes.DATE,
        allowNull: false},
    status : {
        type: DataTypes.STRING,
        allowNull: false
    }
}, { timestamps: false });
        
const PurchaseMovement = sequelize.define('PurchaseMovement',{
    purchaseMid : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchaseId : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lotId : {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subTotal : {
        type: DataTypes.FLOAT,
        allowNull: false
    }   
}, { timestamps: false });



class purchaseModel{
     static async getPurchases(query) {
    try {
      console.log('Query received in getPurchases:', query);
      const page = parseInt(query.page) || 1
      const itemsPerPage = parseInt(query.itemsPerPage) || 10;
      const productSearch = query.product || ''
      const providerSearch = query.provider || ''
      const whereCondition = {}
      const whereConditionProvider = {}
      whereConditionProvider.name = { [Op.like]: `%${providerSearch}%` };
      const whereConditionProduct = {}
      whereConditionProduct.name = { [Op.like]: `%${productSearch}%` };
      const offset = (page - 1) * itemsPerPage;
      if(query.providerId){
        whereCondition.providerId = query.providerId;
      }
      const result = await Purchase.findAndCountAll({
        where: whereCondition,
        limit: itemsPerPage,
        distinct: true,
        offset: offset,
        include: [{
          model: PurchaseMovement,
          as: 'movements',
          include: [{
            model: Product,
            as: 'product',
            required: !!productSearch,
            where: whereConditionProduct
          },
          {
            model: Lot,
            as: 'lot'
          }]
        }, {
          model: Provider,
          as: 'provider',
          required: !!providerSearch, 
          where: whereConditionProvider
        }, {
          model: ProviderPayment,
          as: 'payments'
        }],
        order: [['purchaseId', 'DESC']],
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
  static async createPurchase(purchaseData) {
  const transaction = await sequelize.transaction();

  try {
    const paymentStatus = (purchaseData.dolarValue >= purchaseData.totalPurchase && purchaseData.status === 'Confirmado')
      ? 'Pagado'
      : (purchaseData.dolarValue > 0 ? 'Parcial' : 'Pendiente');

    const purchase = await Purchase.create({
      providerId: purchaseData.providerId,
      totalPurchase: purchaseData.totalPurchase,
      status: paymentStatus,
      date: purchaseData.date
    }, { transaction });
    console.log(purchase)
    if (purchaseData.dolarValue > 0) {
      await ProviderPayment.create({
        purchaseId: purchase.purchaseId,
        providerId: purchaseData.providerId,
        dolarValue: purchaseData.dolarValue,
        bsValue: purchaseData.bsValue,
        method: purchaseData.method,
        status: purchaseData.status,
        date: purchaseData.date
      }, { transaction });
    }

    // 4. Procesar los ítems recibidos (Creación de Lotes y Movimientos)
    if (!purchaseData.items || purchaseData.items.length === 0) {
      await transaction.commit();
      return purchase;
    }

    for (const item of purchaseData.items) {
      const subTotalItem = item.quantity * item.price;

      const lote = await Lot.create({
        productId: item.productId,
        providerId: purchaseData.providerId,
        initialQuantity: item.quantity,
        actualQuantity: item.quantity,
        price: item.price,
        status: 'Disponible',
        date: purchaseData.date
      }, { transaction });

      await PurchaseMovement.create({
        purchaseId: purchase.purchaseId,
        productId: item.productId,
        lotId: lote.lotId,
        quantity: item.quantity,
        subTotal: subTotalItem
      }, { transaction });

      await LotMovement.create({
        lotId: lote.lotId,
        movementType: 'ENTRADA',
        quantity: item.quantity, // Positivo porque suma stock
        motive: `Compra #${purchase.purchaseId}`,
        userId: purchaseData.userId || 1,
        timeStamp: new Date()
      }, { transaction });
    }

    await transaction.commit();
    return purchase;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
static async createProviderPayment(paymentData) {
  const transaction = await sequelize.transaction();

  try {
    const payment = await ProviderPayment.create(paymentData, { transaction });
    const purchase = await Purchase.findByPk(paymentData.purchaseId, { transaction });

    if (purchase) {
      const totalPaid = await ProviderPayment.sum('dolarValue', {
        where: {
          purchaseId: paymentData.purchaseId,
          status: 'Confirmado'
        },
        transaction
      }) || 0;

      let newStatus = 'Pendiente';
      if (totalPaid >= Number(purchase.totalPurchase)) {
        newStatus = 'Pagado';
      } else if (totalPaid > 0) {
        newStatus = 'Parcial';
      }

      await purchase.update({ status: newStatus }, { transaction });
    }

    await transaction.commit();
    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

static async updateProviderPayment(providerPaymentId, paymentData) {
  const transaction = await sequelize.transaction();

  try {
    const payment = await ProviderPayment.findByPk(providerPaymentId, { transaction });
    if (!payment) {
      throw new Error('Pago a proveedor no encontrado');
    }

    await payment.update(paymentData, { transaction });
    const purchase = await Purchase.findByPk(payment.purchaseId, { transaction });

    if (purchase) {
      const totalPaid = await ProviderPayment.sum('dolarValue', {
        where: {
          purchaseId: payment.purchaseId,
          status: 'Confirmado'
        },
        transaction
      }) || 0;

      let newStatus = 'Pendiente';
      if (totalPaid >= Number(purchase.totalPurchase)) {
        newStatus = 'Pagado';
      } else if (totalPaid > 0) {
        newStatus = 'Parcial';
      }

      await purchase.update({ status: newStatus }, { transaction });
    }

    await transaction.commit();
    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
}
module.exports = {purchaseModel, Purchase, PurchaseMovement, ProviderPayment};