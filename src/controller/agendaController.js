const db = require("../db/connect"); // Importa o pool de conexões com suporte a callbacks

module.exports = class agendaController {
  // Cadastro de Notas
  static async postNota(req, res) {
    const inserirAgenda = (fkIdUsuario, data, hora, descricao, callback) => {
      const query = `INSERT INTO Agenda (FK_ID_Usuario, Data, Hora, Descricao) VALUES (?, ?, ?, ?)`;
      db.query(
        query,
        [fkIdUsuario, data, hora, descricao],
        (error, results) => {
          if (error) {
            callback(error, null);
          } else {
            callback(null, results);
          }
        }
      );
    };

    const { fkIdUsuario, data, hora, descricao } = req.body;

    inserirAgenda(fkIdUsuario, data, hora, descricao, (error, result) => {
      if (error) {
        res.status(500).json({ message: "Erro ao inserir registro", error });
      } else {
        res
          .status(201)
          .json({ message: "Registro inserido com sucesso", result });
      }
    });
  }

  // Verificação de Notas
  static async getNota(req, res) {
    const { idUsuario, data, hora } = req.body;

    if (!idUsuario || !data || !hora) {
      return res
        .status(400)
        .json({ message: "ID de usuário, data e hora são obrigatórios." });
    }

    try {
      const query = `
                SELECT * FROM Agenda 
                WHERE FK_ID_Usuario = ? AND Data = ? AND Hora = ?
            `;

      const [rows] = await db.promise().execute(query, [idUsuario, data, hora]);

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          message:
            "Nenhuma nota encontrada para o usuário, data e hora especificados.",
        });
      }

      return res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao buscar a nota." });
    }
  }

  // Atualização de Notas
  static async updateNota(req, res) {
    const { idAgenda, descricao } = req.body;

    // Valida os parâmetros
    if (!idAgenda) {
      return res.status(400).json({ message: "ID da agenda é obrigatório." });
    }

    try {
      // Verifica se a descrição está vazia ou contém apenas espaços em branco
      if (!descricao || descricao.trim().length === 0) {
        // Query para deletar a nota
        const deleteQuery = `
                DELETE FROM Agenda 
                WHERE ID_Agenda = ?
            `;

        // Executa a query de exclusão
        const [deleteResult] = await db
          .promise()
          .execute(deleteQuery, [idAgenda]);

        // Verifica se a exclusão foi realizada
        if (deleteResult.affectedRows === 0) {
          return res.status(404).json({
            message: "Nenhuma nota encontrada com o ID especificado.",
          });
        }

        // Retorna sucesso na exclusão
        return res.status(200).json({
          message: "Nota deletada com sucesso.",
        });
      } else {
        // Query para atualizar o texto da nota
        const updateQuery = `
                UPDATE Agenda 
                SET Descricao = ? 
                WHERE ID_Agenda = ?
            `;

        // Executa a query de atualização
        const [updateResult] = await db
          .promise()
          .execute(updateQuery, [descricao, idAgenda]);

        // Verifica se a atualização foi realizada
        if (updateResult.affectedRows === 0) {
          return res.status(404).json({
            message: "Nenhuma nota encontrada com o ID especificado.",
          });
        }

        // Retorna sucesso na atualização
        return res.status(200).json({
          message: "Nota atualizada com sucesso.",
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erro ao atualizar ou deletar a nota." });
    }
  }
};
