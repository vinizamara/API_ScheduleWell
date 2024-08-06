//Constantes
const router = require('express').Router();
const LoginController = require('../controller/loginController');
const userController = require('../controller/userController');

router.post('/createUser/', userController.createUser);
router.get('/getUsers/', userController.getUsers);
router.put('/updateUser/:id', userController.updateUser);
router.delete('/deleteUser/:id', userController.deleteUser);
router.post('/login/', LoginController.postLogin);
module.exports = router

