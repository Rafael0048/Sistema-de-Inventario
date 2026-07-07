var express = require('express')
var router = express.Router();
const productsController = require('../controllers/productsController.js');
/* GET products listing. */
router.get('/:id?', async function(req, res, next) {
    try {
        let products = await productsController.getProducts(req.params.id);
        res.send(products);
    } catch (error) {
        res.status(500).send({message: 'Error obteniendo los productos', error: error.message});
    }
});

router.post('/', async function(req,res){
    try{
        await productsController.addProduct(req.body);
        res.send({message: 'Product agregado correctamente'});
    } catch (error) {
        console.log(error);
        res.status(500).send({message: 'Error agregando el producto', error: error.message});
    }
})
router.post('/stock', async function(req, res){
    try{
        await productsController.addStock(req.body.productId, req.body.stockData);
        res.send({message: 'Stock agregado correctamente'});
    } catch (error) {
        res.status(500).send({message: 'Error agregando el stock', error: error.message});
    }
})
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

module.exports = router;