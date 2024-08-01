const connect = require ("./connect");

module.exports = function testConnect(){
    try{
        const query = `SELECT 'Conexão bem-sucedida' AS Mensagem`;
        connect.query(query, function(err){
            if(err){
                console.log("Erro na conexão:" + err);
                return;
            }
            console.log("Conexão Realizada com Mysql !")
        })
    }
    catch(error){
        console.log("Erro ao executar a consulta:", error);
    }
}
