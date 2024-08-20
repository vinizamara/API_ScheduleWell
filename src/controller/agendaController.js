const db = require('../db/connect'); // Importa o pool de conexões com suporte a callbacks

module.exports = class agendaController {
    static postAgenda(req, res) {
        // Função para inserir um novo registro na tabela Agenda
        const inserirAgenda = (fkIdUsuario, data, hora, descricao, callback) => {
            const query = `INSERT INTO Agenda (FK_ID_Usuario, Data, Hora, Descricao) VALUES (?, ?, ?, ?)`;
            db.query(query, [fkIdUsuario, data, hora, descricao], (error, results) => {
                if (error) {
                    // Chama o callback com o erro
                    callback(error, null);
                } else {
                    // Chama o callback com o resultado
                    callback(null, results);
                }
            });
        };

        // Obtenha dados da requisição
        const { fkIdUsuario, data, hora, descricao } = req.body;

        // Chama a função inserirAgenda
        inserirAgenda(fkIdUsuario, data, hora, descricao, (error, result) => {
            if (error) {
                res.status(500).json({ message: 'Erro ao inserir registro', error });
            } else {
                res.status(201).json({ message: 'Registro inserido com sucesso', result });
            }
        });
    }
};
