const connect = require('./connect');

module.exports = async function testConnect() {
    try {
        const query = `SELECT 'Conexão bem-sucedida' AS Mensagem`;

        // Usando async/await para executar a query
        const [rows] = await connect.query(query);

        console.log(rows[0].Mensagem); // Exibe a mensagem "Conexão bem-sucedida"
        console.log("Conexão com banco realizada com sucesso!");
    } catch (error) {
        console.log("Erro ao executar a consulta:", error);
    }
};
