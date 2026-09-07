const { DataTypes, Op, where } = require('sequelize');
const {User} = require('./userModel.js')
const sequelize = require('../db.js');
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
    type: DataTypes.STRING,
    allowNull: false 
  },
  height: {
    type: DataTypes.STRING,
    allowNull: false 
  },
  length: {
    type: DataTypes.STRING,
    allowNull: false 
  }
}, { timestamps: false });

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
  status: { type: DataTypes.STRING },
  providerId : {
    type: DataTypes.INTEGER, allowNull: false,
  }
}, { timestamps: false, tableName: 'lot' });

const LotMovement = sequelize.define('LotMovement', {
  movementId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lotId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  movementType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  motive: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  timeStamp: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, { tableName: 'lotmovements', timestamps: false });

// Relaciones


class productsModels {
  static async getProducts(productId, query) {
    try {
      const { Provider } = sequelize.models;
      const page = parseInt(query.page) || 1;
      const itemsPerPage = parseInt(query.itemsPerPage) || 10;
      const search = query.search || '';
      const whereCondition = search ? {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } }
        ]
      } : {};
      const noZeroStock = query.noZeroStock
      const whereLot = noZeroStock ? { actualQuantity: { [Op.gt]: 0 } } : {};      
      const offset = (page - 1) * itemsPerPage;
      const result = await Product.findAndCountAll({
        where: whereCondition,
        limit: itemsPerPage,
        offset: offset,
        include: [{
          model: Lot,
          as: 'lot',
          include: [{
            model: Provider,
            as: 'provider',
            attributes: ['name']
          }],
          where : whereLot
        }],
        order: [['productId', 'DESC']] 
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getLot(productId) {
    try {
      const { Provider } = sequelize.models;
      const result = await Lot.findAll({
        include: [{
            model: Provider,
            as: 'provider',
            attributes: ['name']
          }],
        where: { productId }
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async addStock(stockData) {
    try {
      const { initialQuantity, actualQuantity, price, date, productId, userId , providerId } = stockData;
      
      const result = await Lot.create({ 
        productId, 
        initialQuantity, 
        price, 
        date, 
        actualQuantity,
        status: 'Disponible',
        providerId
      });

      await LotMovement.create({
        lotId: result.lotId,
        movementType: 'ENTRADA',
        quantity: initialQuantity,
        motive: 'Ingreso de lote',
        userId: userId || 1,
        timeStamp: new Date()
      });
     

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async addProduct(productData) {
    try {
      const { name, width, height, length, price, date, quantity, userId } = productData;
      const result = await Product.create({ name, width, height, length });

      if (price && quantity && date) {
        await productsModels.addStock({
          productId: result.productId,
          initialQuantity: quantity,
          actualQuantity: quantity,
          price,
          date,
          userId
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async modifyProduct(productId, productData) {
    try {
      const { name, width, height, length } = productData;
      const result = await Product.update({ name, width, height, length }, { where: { productId } });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteProduct(productId) {
    try {
      const result = await Product.destroy({ where: { productId } });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async modifyStock(lotId, stockData) {
    try {
      const { quantity, price, date, userId, oldQuantity } = stockData;
      let result;
      let movementType;
      if(quantity>=1){
         result = await Lot.update({ actualQuantity: quantity, price, date, status:'Disponible' }, { where: { lotId } });
        }else{
          result = await Lot.update({ actualQuantity: quantity, price, date, status:'Vendido' }, { where: { lotId } });
          
        }
        const registerQuantity = quantity - oldQuantity;  
        if(registerQuantity>0){
          movementType = 'AJUSTE POSITIVO'
        }else{
          movementType = 'AJUSTE NEGATIVO'
        }
      await LotMovement.create({
        lotId: lotId,
        movementType: movementType,
        quantity: registerQuantity,
        motive: 'Ajuste del lote',
        userId: userId || 1,
        timeStamp: new Date()
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async deleteStock(lotId) {
    try {
      const result = await Lot.destroy({ where: { lotId } });
      return result;
    } catch (error) {
      throw error;
    }
  }

  
  static async createMovement(movementData) {
    try {
      const { lotId, movementType, quantity, motive, userId } = movementData;
      const result = await LotMovement.create({
        lotId,
        movementType,
        quantity,
        motive,
        userId,
        timeStamp: new Date()
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getMovementsByLot(query) {
  try {
  console.log(query);
  const page = parseInt(query.page) || 1;
  const itemsPerPage = parseInt(query.itemsPerPage) || 10;
  const search = query.search || '';
  const movementType = query.movementType || '';
  const product = query.product || '';
  const user = query.userName || ''
  const whereCondition = {};

  if (search) {
    whereCondition.motive = { [Op.like]: `%${search}%` };
  }

  if (movementType) {
    whereCondition.movementType = movementType;
  }

  

  const productWhere = product ? { name: { [Op.like]: `%${product}%` } } : undefined;
  const userWhere = user ? {userName : { [Op.like]: `%${user}%`}}: undefined
  const offset = (page - 1) * itemsPerPage;

  const includeConfig = [
    {
      model: User,
      as: 'user',
      attributes: ["userName"],
      where: userWhere,
      required: !!user

    },
    {
      model: Lot,
      as: 'lot',
      attributes: ["lotId"],
      required: !!product, 
      include: [{
        model: Product,
        as: 'product',
        attributes: ["name"],
        where: productWhere,
        required: !!product
      }]
    }
  ];

  const result = await LotMovement.findAndCountAll({
    where: whereCondition,
    limit: itemsPerPage,
    offset: offset,
    distinct: true,
    include: includeConfig,
    order: [['movementId', 'DESC']]
  });

  const totals = await LotMovement.findAll({
    where: whereCondition,
    include: includeConfig,
    attributes: [
      'movementType',
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
    ],
    group: ['movementType'],
    raw: true
  });

  const metrics = { totalEntradas: 0, totalVentas: 0, totalAjustesNegativos: 0,totalAjustesPositivos: 0 };

 totals.forEach(item => {
  const type = item.movementType;
  const rawSum = Number(item.totalQuantity) || 0; 
  const sum = Math.abs(rawSum);                   

  if (type === 'ENTRADA') {
    metrics.totalEntradas += sum;
  } else if (type === 'VENTA') {
    metrics.totalVentas += sum;
  } else if (type === 'AJUSTE POSITIVO') {
      metrics.totalAjustesPositivos += sum;
    } else if (type === 'AJUSTE NEGATIVO') {
      metrics.totalAjustesNegativos += sum;
    }
  } )

  return {
    rows: result.rows,
    count: result.count,
    metrics
  };
} catch (error) {
  throw error;
}
 }

  static async adjustStock(lotId, adjustData) {
    try {
      const { newQuantity, motive, userId, movementType } = adjustData;

      const lot = await Lot.findByPk(lotId);
      if (!lot) throw new Error('Lote no encontrado');

      const diferencia = newQuantity - lot.actualQuantity;
      const newStatus = newQuantity === 0 ? 'Vendido' : 'Disponible';

      await Lot.update(
        { actualQuantity: newQuantity, status: newStatus },
        { where: { lotId } }
      );

      await LotMovement.create({
        lotId,
        movementType: movementType || (diferencia < 0 ? 'MERMA' : 'INGRESO'),
        quantity: diferencia,
        motive: motive || 'Ajuste de inventario',
        userId: userId || 1,
        timeStamp: new Date()
      });

      return { success: true, newQuantity };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { productsModels, Product, Lot, LotMovement };