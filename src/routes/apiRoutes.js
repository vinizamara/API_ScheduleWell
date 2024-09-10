//Constantes
const router = require('express').Router();
const LoginController = require('../controller/loginController');
const UserController = require('../controller/userController');
const AnotacoesController = require('../controller/anotacoesController');
const FinancasController = require('../controller/financasController');

//Rotas do Usuario
router.post('/createUser/', UserController.createUser);
router.get('/getUsers/', UserController.getUsers);
router.put('/updateUser/:id', UserController.updateUser);
router.delete('/deleteUser/:id', UserController.deleteUser);
router.post('/login/', LoginController.postLogin);

// Rotas de Anotações
router.post('/postNota/', AnotacoesController.postNota);
router.get('/getAnotacao/:idUsuario', AnotacoesController.getNota);
router.put('/updateNota/', AnotacoesController.updateNota);
router.delete('/deleteNota/:idAnotacao', AnotacoesController.deleteNota); 

//Rotas de Anotações de Finanças
router.post('/criarFinanca/', FinancasController.criarFinanca);
router.get('/listarFinancas/:fk_id_usuario', FinancasController.listarFinancas);
router.put('/atualizarFinanca/:id_financa', FinancasController.atualizarFinanca);
router.delete('/deletarFinanca/:id_financa', FinancasController.deletarFinanca);

module.exports = router;
