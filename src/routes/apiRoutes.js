//Constantes
const router = require('express').Router();
const UserController = require('../controller/userController');
const AnotacoesController = require('../controller/anotacoesController');
const FinancasController = require('../controller/financasController');
const ChecklistController = require('../controller/checklistController');
const ItemChecklistController = require('../controller/itemChecklistController');

//Rotas do Usuario
router.post('/createUser/', UserController.createUser);
router.get('/getUsers/', UserController.getUsers);
router.put('/updateUser/:id', UserController.updateUser);
router.delete('/deleteUser/:id', UserController.deleteUser);
router.post('/login/', UserController.postLogin);

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


// Rotas de Checklist
router.post('/postChecklist/', ChecklistController.postChecklist);
router.get('/getChecklist/:idUsuario', ChecklistController.getChecklist);
router.put('/updateChecklist/', ChecklistController.updateChecklist);
router.delete('/deleteChecklist/:idChecklist', ChecklistController.deleteChecklist);

// Rotas de Item de Checklist
router.post('/postItemChecklist/', ItemChecklistController.postItemChecklist);
router.get('/getItemChecklist/:idChecklist', ItemChecklistController.getItemChecklist);
router.put('/updateItemChecklist/', ItemChecklistController.updateItemChecklist);
router.delete('/deleteItemChecklist/:fkIdChecklist', ItemChecklistController.deleteItemChecklist);

module.exports = router;
