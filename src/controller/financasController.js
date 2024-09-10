const db = require("../db/connect");

module.exports = class FinancasController {
    // Criar notas de Finanças
    static async criarFinanca(req, res) {
        try {
            const { fk_id_usuario, titulo, descricao, data, tipo_transacao, valor, frequencia } = req.body;

            if (!fk_id_usuario || !titulo || !data || !tipo_transacao || !valor || !frequencia) {
                return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
            }

            const query = `
                INSERT INTO financa (fk_id_usuario, titulo, descricao, data, tipo_transacao, valor, frequencia)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            await db.execute(query, [fk_id_usuario, titulo, descricao || null, data, tipo_transacao, valor, frequencia]);

            return res.status(201).json({ message: "Anotação de finanças criada com sucesso." });
        } catch (error) {
            console.error("Erro ao criar anotação de finanças:", error);
            return res.status(500).json({ message: "Erro ao criar anotação de finanças." });
        }
    }

    // Listar notas de Finanças
    static async listarFinancas(req, res) {
        try {
            const { fk_id_usuario } = req.params;

            if (!fk_id_usuario) {
                return res.status(400).json({ message: "ID do usuário é necessário." });
            }

            // Query para listar as finanças do usuário
            const query = `
                SELECT * FROM financa WHERE fk_id_usuario = ?
            `;

            // Use query para garantir que o retorno será desestruturado corretamente
            const [result] = await db.query(query, [fk_id_usuario]);

            // Verifica se existem resultados
            if (result.length === 0) {
                return res.status(404).json({ message: "Nenhuma anotação de finanças encontrada." });
            }

            return res.status(200).json(result); // Retorna as anotações de finanças
        } catch (error) {
            console.error("Erro ao listar anotações de finanças:", error);
            return res.status(500).json({ message: "Erro ao listar anotações de finanças." });
        }
    }

    // Atualizar notas de Finanças
    static async atualizarFinanca(req, res) {
        try {
            const { id_financa } = req.params; // ID da anotação de finanças
            const { titulo, descricao, data, tipo_transacao, valor, frequencia } = req.body;

            // Valida se o ID da nota foi passado
            if (!id_financa) {
                return res.status(400).json({ message: "ID da anotação de finanças é obrigatório." });
            }

            // Valida se os campos obrigatórios estão presentes
            if (!titulo || !data || !tipo_transacao || !valor || !frequencia) {
                return res.status(400).json({ message: "Todos os campos obrigatórios devem ser preenchidos." });
            }

            // Query para atualizar a nota de finanças
            const query = `
                UPDATE financa
                SET titulo = ?, descricao = ?, data = ?, tipo_transacao = ?, valor = ?, frequencia = ?
                WHERE id_financa = ?
            `;

            // Executa a query de atualização
            const [result] = await db.execute(query, [titulo, descricao || null, data, tipo_transacao, valor, frequencia, id_financa]);

            // Verifica se alguma linha foi afetada (se a nota foi atualizada)
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Anotação de finanças não encontrada." });
            }

            return res.status(200).json({ message: "Anotação de finanças atualizada com sucesso." });
        } catch (error) {
            console.error("Erro ao atualizar anotação de finanças:", error);
            return res.status(500).json({ message: "Erro ao atualizar anotação de finanças." });
        }
    }

    //Deleção de notas de Finanças
    static async deletarFinanca(req, res) {
        try {
            const { id_financa } = req.params;

            if (!id_financa) {
                return res.status(400).json({ message: "ID da anotação de finanças é obrigatório." });
            }

            const query = `
                DELETE FROM financa WHERE id_financa = ?
            `;

            const [result] = await db.execute(query, [id_financa]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Anotação de finanças não encontrada." });
            }

            return res.status(200).json({ message: "Anotação de finanças deletada com sucesso." });
        } catch (error) {
            console.error("Erro ao deletar anotação de finanças:", error);
            return res.status(500).json({ message: "Erro ao deletar anotação de finanças." });
        }
    }
};

