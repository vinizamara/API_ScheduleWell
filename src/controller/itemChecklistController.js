const db = require("../db/connect"); // Importa o pool de conexões com suporte a Promises

module.exports = class itemChecklistController {
  // Adicionar Item ao Checklist
  static async postItemChecklist(req, res) {
    const { fkIdChecklist, texto, concluido } = req.body;

    if (!fkIdChecklist || texto === undefined || concluido === undefined) {
      return res.status(400).json({ message: "Dados obrigatórios faltando." });
    }

    try {
      const query = `
        INSERT INTO item_checklist (FK_ID_Checklist, Texto, Concluido) 
        VALUES (?, ?, ?)
      `;
      const [result] = await db.execute(query, [fkIdChecklist, texto, concluido]);
      res.status(201).json({
        message: "Item adicionado ao checklist com sucesso",
        result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao inserir item no checklist", error });
    }
  }

  // Obter Itens de um Checklist
  static async getItemChecklist(req, res) {
    const { idChecklist } = req.params;

    if (!idChecklist) {
      return res.status(400).json({ message: "ID do checklist é obrigatório." });
    }

    try {
      const query = `
        SELECT * FROM item_checklist
        WHERE FK_ID_Checklist = ?
      `;
      const [rows] = await db.execute(query, [idChecklist]);

      if (!rows || rows.length === 0) {
        return res.status(404).json({
          message: "Nenhum item encontrado para o checklist especificado.",
        });
      }

      res.status(200).json(rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar itens do checklist." });
    }
  }

  // Atualizar Item do Checklist
  static async updateItemChecklist(req, res) {
    const { fkIdChecklist, texto, concluido } = req.body;

    if (!fkIdChecklist) {
      return res.status(400).json({ message: "ID do item do checklist é obrigatório." });
    }

    try {
      // Verifica se o item existe
      const checkItemQuery = `
        SELECT * FROM item_checklist
        WHERE FK_ID_Checklist = ?
      `;
      const [checkResult] = await db.execute(checkItemQuery, [fkIdChecklist]);

      if (checkResult.length === 0) {
        return res.status(404).json({
          message: "Nenhum item encontrado com o ID especificado.",
        });
      }

      // Query para atualizar o item do checklist
      let updateQuery = "UPDATE item_checklist SET ";
      const queryParams = [];

      if (texto !== undefined) {
        updateQuery += "Texto = ? ";
        queryParams.push(texto);
      }

      if (concluido !== undefined) {
        if (texto !== undefined) {
          updateQuery += ", ";
        }
        updateQuery += "Concluido = ? ";
        queryParams.push(concluido);
      }

      updateQuery += "WHERE FK_ID_Checklist = ?";
      queryParams.push(fkIdChecklist);

      const [updateResult] = await db.execute(updateQuery, queryParams);

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({
          message: "Nenhum item encontrado com o ID especificado.",
        });
      }

      res.status(200).json({
        message: "Item do checklist atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar o item do checklist:", error);
      res.status(500).json({
        message: "Erro ao atualizar o item do checklist.",
        error: error.message, // Inclui a mensagem de erro na resposta
      });
    }
  }

  // Deletar Item do Checklist
  static async deleteItemChecklist(req, res) {
    const { fkIdChecklist } = req.params;

    if (!fkIdChecklist) {
      return res.status(400).json({ message: "ID do item do checklist é obrigatório." });
    }

    try {
      const deleteQuery = `
        DELETE FROM item_checklist
        WHERE FK_ID_Checklist = ?
      `;
      const [deleteResult] = await db.execute(deleteQuery, [fkIdChecklist]);

      if (deleteResult.affectedRows === 0) {    
        return res.status(404).json({
          message: "Nenhum item encontrado com o ID especificado.",
        });
      }

      res.status(200).json({
        message: "Item do checklist deletado com sucesso.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao deletar o item do checklist." });
    }
  }
};
