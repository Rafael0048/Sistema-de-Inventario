let express = require('express');
let router = express.Router();
const userController = require('../controllers/userController.js');

router.post('/register', async function(req, res) {
    try{
        await userController.registerUser(req.body);
        res.send({message: 'Usuario registrado correctamente',});
    } catch (error) {
        res.status(500).send({message: 'Error al registrar usuario', error: error});
    }
})
router.post('/login', async function(req, res) {
    try{
        const result = await userController.loginUser(req.body);
        res.send({message: 'Usuario logueado correctamente', user: result.user, token: result.token});
    } catch (error) {
        console.log( error)
        res.status(400).send({message: 'Error al iniciar sesión', error: error.message});
    }
})
router.get('/', async function(req, res){
    try{
        let result = await userController.getUsers(req.query)
            res.send(result)
    }
    catch(error){
        console.log(error)
        res.status(500).send({message: 'Error al obtener usuarios', error: error.message});
    }
})
module.exports = router;