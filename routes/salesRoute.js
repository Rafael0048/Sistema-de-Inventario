let express = require('express');
let router = express.Router();
const salesController = require('../controllers/salesController.js');   
router.get('/:id?', async function(req, res) {
    try{
        const sales = await salesController.getSales(req.params.id, req.query);
        res.send(sales);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.post('/', async function(req, res) {
    try{
        const sale = await salesController.createSale(req.body);
        res.send(sale);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.put('/:id', async function(req, res) {
    try{
        const sale = await salesController.updateSale(req.params.id, req.body);
        res.send(sale);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.delete('/:id', async function(req, res) {
    try{
        const sale = await salesController.deleteSale(req.params.id);
        res.send(sale);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.post('/payment', async function(req, res){
    try{
        const payment = await salesController.createPayment(req.body);
        res.send(payment);
    }catch(error){
        console.log(error)
        res.status(500).send({ error: error.message });
    }
})
router.put('/payment/:id', async function(req, res){
    try{
        const payment = await salesController.updatePayment(req.params.id, req.body);
        res.send(payment);
    }catch(error){
        console.log(error)
        res.status(500).send({ error: error.message });
    }
})
module.exports = router;