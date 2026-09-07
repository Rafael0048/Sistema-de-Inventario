let express = require('express');
let router = express.Router();
const providerController = require('../controllers/providerController.js');   
router.get('/:id?', async function(req, res) {
    try{
        const providers = await providerController.getProvider(req.params.id, req.query);
        res.send(providers);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.post('/', async function(req, res) {
    try{
        const provider = await providerController.createProvider(req.body);
        res.send(provider);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.put('/:id', async function(req, res) {
    try{
        const provider = await providerController.updateProvider(req.params.id, req.body);
        res.send(provider);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.delete('/:id', async function(req, res) {
    try{
        const provider = await providerController.deleteProvider(req.params.id);
        res.send(provider);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
module.exports = router;