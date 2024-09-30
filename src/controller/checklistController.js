const db = require("../db/connect"); // Importa o pool de conexões

module.exports = class checklistController {
  // Cadastro de Checklists
    // Cadastro de Checklists
    static async postChecklist(req, res) {
      const { fkIdUsuario, titulo, data, descricao } = req.body;
  
      if (!fkIdUsuario || !titulo || !data) {
        return res.status(400).json({ message: "Dados obrigatórios faltando." });
      }
  
      try {
        const query = `INSERT INTO checklist (fk_id_usuario, titulo, data, descricao) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(query, [fkIdUsuario, titulo, data, descricao]);
        console.log(result);
        res.status(201).json({ message: "Checklist inserido com sucesso", result });
      } catch (error) {
        console.error(error);
        // Extrai a mensagem de erro específica se disponível
        const errorMessage = error.sqlMessage || "Erro ao inserir checklist";
        res.status(500).json({ message: errorMessage });
      }
    }

  // Verificação de Checklists
  static async getChecklist(req, res) {
    const { idUsuario } = req.params;

    if (!idUsuario) {
      return res.status(400).json({ message: "ID do usuário é obrigatório." });
    }

    try {
      const query = `SELECT * FROM checklist WHERE fk_id_usuario = ?`;
      const [rows] = await db.execute(query, [idUsuario]);

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Nenhum checklist encontrado para o usuário especificado." });
      }

      res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar os checklists." });
    }
  }

  // Atualização de Checklists
  static async updateChecklist(req, res) {
    const { idChecklist } = req.params; // Obtendo o ID do checklist dos parâmetros da URL
    const { titulo, descricao } = req.body;

    if (!idChecklist) {
        return res.status(400).json({ message: "ID do checklist é obrigatório." });
    }

    try {
        if (!titulo && !descricao) {
            return res.status(400).json({ message: "Pelo menos um campo de atualização (título ou descrição) deve ser fornecido." });
        }

        let updateQuery = `UPDATE checklist SET `;
        const queryParams = [];

        if (titulo) {
            updateQuery += `titulo = ? `;
            queryParams.push(titulo);
        }

        if (descricao) {
            if (titulo) {
                updateQuery += `, `;
            }
            updateQuery += `descricao = ? `;
            queryParams.push(descricao);
        }

        updateQuery += `WHERE id_checklist = ?`;
        queryParams.push(idChecklist); // Adicionando o ID do checklist ao final da query

        const [updateResult] = await db.execute(updateQuery, queryParams);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Nenhum checklist encontrado com o ID especificado." });
        }

        res.status(200).json({ message: "Checklist atualizado com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao atualizar o checklist." });
    }
}


  // Exclusão de Checklists
  static async deleteChecklist(req, res) {
    const { idChecklist } = req.params;

    if (!idChecklist) {
      return res.status(400).json({ message: "ID do checklist é obrigatório." });
    }

    try {
      // Primeiro, exclui todos os itens associados ao checklist
      const deleteItemsQuery = `DELETE FROM item_checklist WHERE FK_ID_Checklist = ?`;
      await db.execute(deleteItemsQuery, [idChecklist]);

      // Depois, exclui o checklist
      const deleteChecklistQuery = `DELETE FROM checklist WHERE id_checklist = ?`;
      const [deleteResult] = await db.execute(deleteChecklistQuery, [idChecklist]);

      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ message: "Nenhum checklist encontrado com o ID especificado." });
      }

      res.status(200).json({ message: "Checklist e seus itens deletados com sucesso." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao deletar o checklist e seus itens." });
    }
  }
};
