let express = require('express');
let router = express.Router();
const clientsController = require('../controllers/clientsController.js');   
router.get('/:id?', async function(req, res) {
    try{
        const clients = await clientsController.getClients(req.params.id);
        res.send(clients);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.post('/', async function(req, res) {
    try{
        const client = await clientsController.createClient(req.body);
        res.send(client);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.put('/:id', async function(req, res) {
    try{
        const client = await clientsController.updateClient(req.params.id, req.body);
        res.send(client);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
router.delete('/:id', async function(req, res) {
    try{
        const client = await clientsController.deleteClient(req.params.id);
        res.send(client);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
module.exports = router;