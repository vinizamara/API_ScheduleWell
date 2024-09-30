const db = require("../db/connect"); // Importa o pool de conexões

module.exports = class AnotacoesController {
  // Cadastro de Notas (Create)
  static async postNota(req, res) {
    const { fk_id_usuario, data, titulo, descricao } = req.body;

    if (!fk_id_usuario || !data || !titulo || !descricao) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    const query = `INSERT INTO anotacao (fk_id_usuario, data, titulo, descricao) VALUES (?, ?, ?, ?)`;

    try {
      const [result] = await db.execute(query, [fk_id_usuario, data, titulo, descricao]);
      res.status(201).json({ message: "Registro inserido com sucesso", result });
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ message: "Erro ao inserir registro", error: error.message });
    }
  }

  // Verificação de Notas (Read)
  static async getNota(req, res) {
    const { idUsuario } = req.params;

    if (!idUsuario) {
      return res.status(400).json({ message: "ID de usuário é obrigatório." });
    }

    const query = `SELECT * FROM anotacao WHERE fk_id_usuario = ?`;

    try {
      const [rows] = await db.execute(query, [idUsuario]);

      if (rows.length === 0) {
        return res.status(404).json({ message: "Nenhuma nota encontrada para o ID de usuário especificado." });
      }

      res.status(200).json(rows);
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ message: "Erro ao buscar as notas.", error: error.message });
    }
  }

  // Atualização de Notas (Update)
  static async updateNota(req, res) {
    const { idAnotacao } = req.params; // Recebe o ID da anotação dos parâmetros da requisição
    const { titulo, descricao, data } = req.body;

    // Validação básica do ID da anotação
    if (!idAnotacao) {
      return res.status(400).json({ message: "ID da anotação é obrigatório." });
    }

    const idAnotacaoInt = parseInt(idAnotacao, 10);
    if (isNaN(idAnotacaoInt)) {
      return res.status(400).json({ message: "ID da anotação deve ser um número válido." });
    }

    // Valida se pelo menos um dos campos foi fornecido para atualizar
    if (!titulo && !descricao && !data) {
      return res.status(400).json({ message: "Pelo menos um campo para atualizar deve ser fornecido." });
    }

    // Constrói a query dinamicamente conforme os campos fornecidos
    let query = 'UPDATE anotacao SET ';
    const params = [];

    if (titulo) {
      query += 'titulo = ?, ';
      params.push(titulo);
    }

    if (descricao) {
      query += 'descricao = ?, ';
      params.push(descricao);
    }

    if (data) {
      query += 'data = ?, ';
      params.push(data);
    }

    // Remove a vírgula final e adiciona a cláusula WHERE
    query = query.slice(0, -2);
    query += ' WHERE id_anotacao = ?';
    params.push(idAnotacaoInt);

    try {
      // Executa a query no banco de dados
      const [result] = await db.execute(query, params);

      // Verifica se alguma linha foi atualizada
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Nenhuma anotação encontrada com o ID especificado." });
      }

      // Retorna sucesso
      res.status(200).json({ message: "Anotação atualizada com sucesso." });
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ message: "Erro ao atualizar a anotação.", error: error.message });
    }
  }



  // Exclusão de Notas (Delete)
  static async deleteNota(req, res) {
    const { idAnotacao } = req.params;

    if (!idAnotacao) {
      return res.status(400).json({ message: "ID da anotação é obrigatório." });
    }

    if (!Number.isInteger(parseInt(idAnotacao, 10))) {
      return res.status(400).json({ message: "ID da anotação deve ser um número inteiro válido." });
    }

    const query = `DELETE FROM anotacao WHERE id_anotacao = ?`;

    try {
      const [result] = await db.execute(query, [idAnotacao]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Nenhuma anotação encontrada com o ID especificado." });
      }

      res.status(200).json({ message: "Anotação deletada com sucesso." });
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ message: "Erro ao deletar a anotação.", error: error.message });
    }
  }
};
