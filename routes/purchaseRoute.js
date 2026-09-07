let express = require('express');
let router = express.Router();
const purchaseController = require('../controllers/purchaseController.js');   
router.get('/:id?', async function(req, res) {
    try{
        const purchases = await purchaseController.getPurchases(req.query);
        res.send(purchases);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.post('/', async function(req, res) {
    try{
        const purchase = await purchaseController.createPurchase(req.body);
        res.send(purchase);
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: error.message });
    }
});
router.put('/:id', async function(req, res) {
    try{
        const purchase = await purchaseController.updatePurchase(req.params.id, req.body);
        res.send(purchase);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.delete('/:id', async function(req, res) {
    try{
        const purchase = await purchaseController.deletePurchase(req.params.id);
        res.send(purchase);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.post('/payment', async function(req, res){
    try{
        const payment = await purchaseController.createProviderPayment(req.body);
        res.send(payment);
    }catch(error){
        console.log(error)
        res.status(500).send({ error: error.message });
    }
})
router.put('/payment/:id', async function(req, res){
    try{
        const payment = await purchaseController.updateProviderPayment(req.params.id, req.body);
        res.send(payment);
    }catch(error){
        console.log(error)
        res.status(500).send({ error: error.message });
    }
})
module.exports = router;