var express = require('express');
var router = express.Router();
const verificationToken = require('./verificationToken.js');
const productsController = require('../controllers/productsController.js');

/* GET products listing. */
router.get('/:id?', verificationToken, async function(req, res, next) {
    try {
        const products = await productsController.getProducts(req.params.id, req.query);
        res.send(products);
    } catch (error) {
        res.status(500).send({message: 'Error obteniendo los productos', error: error.message});
    }
});

router.post('/', async function(req, res){
    try{
        await productsController.addProduct(req.body);
        res.send({message: 'Producto agregado correctamente'});
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Error agregando el producto', error: error.message});
    }
});

router.put('/:productId', async function(req, res){
    try{
        await productsController.modifyProduct(req.params.productId, req.body);
        res.send({message: 'Producto modificado correctamente'});
    } catch (error) {
        res.status(500).send({message: 'Error modificando el producto', error: error.message});
    }
});

router.delete('/:productId', async function(req, res){
    try{
        await productsController.deleteProduct(req.params.productId);
        res.send({message: 'Producto eliminado correctamente'});
    } catch (error) {
        res.status(500).send({message: 'Error eliminando el producto', error: error.message});
    }
});
router.get('/stock/movements', async function(req, res) {
    try {
        const movements = await productsController.getMovementsByLot(req.query);
        res.send(movements);
    } catch (error) {
        console.log(error)
        res.status(500).send({message: 'Error obteniendo el historial de movimientos', error: error.message});
    }
});

/* GET stock / lotes listing */
router.get('/stock/:id?', async function(req, res) {
    try {
        let lots = await productsController.getLot(req.params.id);
        res.send(lots);
    } catch (error) {
        res.status(500).send({message: 'Error obteniendo los lotes', error: error.message});
    }
});

router.post('/stock', async function(req, res){
    try{
        await productsController.addStock(req.body);
        res.send({message: 'Stock agregado correctamente'});
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Error agregando el stock', error: error.message});
    }
});


router.put('/stock/:lotId', async function(req, res){
    try{
        await productsController.modifyStock(req.params.lotId, req.body);
        res.send({message: 'Stock modificado correctamente'});
    } catch (error) {
        res.status(500).send({message: 'Error modificando el stock', error: error.message});
    }
});

router.delete('/stock/:lotId', async function(req, res){
    try{
        await productsController.deleteStock(req.params.lotId);
        res.send({message: 'Stock eliminado correctamente'});
    } catch (error) {
        res.status(500).send({message: 'Error eliminando el stock', error: error.message});
    }
});


router.post('/stock/movements', async function(req, res) {
    try {
        await productsController.createMovement(req.body);
        res.send({message: 'Movimiento registrado correctamente'});
    } catch (error) {
        res.status(500).send({message: 'Error registrando el movimiento', error: error.message});
    }
});

router.post('/stock/adjust/:lotId', async function(req, res) {
    try {
        const result = await productsController.adjustStock(req.params.lotId, req.body);
        res.send({message: 'Ajuste de stock realizado correctamente', data: result});
    } catch (error) {
        res.status(500).send({message: 'Error realizando el ajuste de stock', error: error.message});
    }
});

module.exports = router;