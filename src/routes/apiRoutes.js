//Constantes
const router = require('express').Router();
const LoginController = require('../controller/loginController');
const UserController = require('../controller/userController');
const AgendaController = require('../controller/agendaController');

//Rotas do Usuario
router.post('/createUser/', UserController.createUser);
router.get('/getUsers/', UserController.getUsers);
router.put('/updateUser/:id', UserController.updateUser);
router.delete('/deleteUser/:id', UserController.deleteUser);
router.post('/login/', LoginController.postLogin);
//Rotas de Agenda
router.post('/postNota/', AgendaController.postNota);
router.get('/getNota/', AgendaController.getNota);
router.put('/updateNota/', AgendaController.updateNota);
module.exports = router

