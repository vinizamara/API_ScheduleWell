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
      const [result] = await db.execute(query, [fk_id_usuario, data, titulo, descricao]); // Use db.execute diretamente
      res.status(201).json({ message: "Registro inserido com sucesso", result });
    } catch (error) {
      console.error('Error details:', error); // Log detalhado para depuração
      res.status(500).json({ message: "Erro ao inserir registro", error: error.message });
    }
  }

  // Verificação de Notas (Read)
  static async getNota(req, res) {
    const { idUsuario } = req.params; // Usando parâmetros de URL

    if (!idUsuario) {
      return res.status(400).json({ message: "ID de usuário é obrigatório." });
    }

    // Valida se idUsuario é um número inteiro
    if (!Number.isInteger(parseInt(idUsuario, 10))) {
      return res.status(400).json({ message: "ID de usuário deve ser um número inteiro válido." });
    }

    const query = `SELECT * FROM anotacao WHERE fk_id_usuario = ?`;

    try {
      const [rows] = await db.execute(query, [idUsuario]); // Use db.execute diretamente

      if (rows.length === 0) {
        return res.status(404).json({ message: "Nenhuma nota encontrada para o ID de usuário especificado." });
      }

      res.status(200).json(rows);
    } catch (error) {
      console.error('Error details:', error); // Log detalhado para depuração
      res.status(500).json({ message: "Erro ao buscar as notas.", error: error.message });
    }
  }

  // Atualização de Notas (Update)
  static async updateNota(req, res) {
    const { idAnotacao, titulo, descricao } = req.body;
  
    if (!idAnotacao) {
      return res.status(400).json({ message: "ID da anotação é obrigatório." });
    }
  
    // Converta e valide idAnotacao
    const idAnotacaoInt = parseInt(idAnotacao, 10);
    if (isNaN(idAnotacaoInt)) {
      return res.status(400).json({ message: "ID da anotação deve ser um número válido." });
    }
  
    // Verifica se pelo menos um dos campos de atualização foi fornecido
    if (!titulo && !descricao) {
      return res.status(400).json({ message: "Pelo menos um campo para atualizar deve ser fornecido." });
    }
  
    // Cria a consulta SQL dinamicamente com base nos campos fornecidos
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
  
    // Remove a última vírgula e espaço
    query = query.slice(0, -2);
    query += ' WHERE id_anotacao = ?';
    params.push(idAnotacaoInt);
  
    try {
      const [result] = await db.execute(query, params);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Nenhuma anotação encontrada com o ID especificado." });
      }
  
      res.status(200).json({ message: "Anotação atualizada com sucesso." });
    } catch (error) {
      console.error('Error details:', error); // Log detalhado para depuração
      res.status(500).json({ message: "Erro ao atualizar a anotação.", error: error.message });
    }
  }
  

  // Exclusão de Notas (Delete)
  static async deleteNota(req, res) {
    const { idAnotacao } = req.params; // Usando parâmetros de URL

    if (!idAnotacao) {
      return res.status(400).json({ message: "ID da anotação é obrigatório." });
    }

    // Valida se idAnotacao é um número inteiro
    if (!Number.isInteger(parseInt(idAnotacao, 10))) {
      return res.status(400).json({ message: "ID da anotação deve ser um número inteiro válido." });
    }

    const query = `DELETE FROM anotacao WHERE id_anotacao = ?`;

    try {
      const [result] = await db.execute(query, [idAnotacao]); // Use db.execute diretamente

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Nenhuma anotação encontrada com o ID especificado." });
      }

      res.status(200).json({ message: "Anotação deletada com sucesso." });
    } catch (error) {
      console.error('Error details:', error); // Log detalhado para depuração
      res.status(500).json({ message: "Erro ao deletar a anotação.", error: error.message });
    }
  }
};
