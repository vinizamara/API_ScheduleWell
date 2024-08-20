//Constantes
const router = require('express').Router();
const LoginController = require('../controller/loginController');
const UserController = require('../controller/userController');
const AgendaController = require('../controller/agendaController');


router.post('/createUser/', UserController.createUser);
router.get('/getUsers/', UserController.getUsers);
router.put('/updateUser/:id', UserController.updateUser);
router.delete('/deleteUser/:id', UserController.deleteUser);
router.post('/login/', LoginController.postLogin);
router.post('/agenda/', AgendaController.postAgenda);
module.exports = router

