//Constantes
const router = require('express').Router();
const userController = require('../controller/userController');

router.post('/createUser/', userController.createUser);
router.get('/getUsers/', userController.getUsers);
router.put('/updateUser/:id', userController.updateUser);
router.delete('/deleteUser/:id', userController.deleteUser)

module.exports = router

