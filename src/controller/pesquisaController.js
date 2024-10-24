const db = require("../db/connect"); 

module.exports = class PesquisaController {
    // Método para buscar títulos semelhantes nas tabelas financa, anotacao e checklist
    static async buscarTitulosSemelhantes(req, res) {
        const { fk_id_usuario, titulo } = req.params;
    
        if (!fk_id_usuario || !titulo) {
        return res.status(400).json({ message: "ID do usuário e título são necessários." });
        }
    
        try {
        // Query para buscar títulos semelhantes nas três tabelas
        const query = `
            SELECT 'financa' AS tipo, id_financa AS id, titulo, descricao 
            FROM financa 
            WHERE fk_id_usuario = ? AND titulo LIKE CONCAT('%', ?, '%')
    
            UNION ALL
    
            SELECT 'anotacao' AS tipo, id_anotacao AS id, titulo, descricao 
            FROM anotacao 
            WHERE fk_id_usuario = ? AND titulo LIKE CONCAT('%', ?, '%')
    
            UNION ALL
    
            SELECT 'checklist' AS tipo, id_checklist AS id, titulo, descricao 
            FROM checklist 
            WHERE fk_id_usuario = ? AND titulo LIKE CONCAT('%', ?, '%');
        `;
    
        const [resultados] = await db.query(query, [fk_id_usuario, titulo, fk_id_usuario, titulo, fk_id_usuario, titulo]);
    
        if (resultados.length === 0) {
            return res.status(404).json({ message: "Nenhum título semelhante encontrado." });
        }
    
        return res.status(200).json({ resultados });
        } catch (error) {
        console.error("Erro ao buscar títulos semelhantes:", error);
        return res.status(500).json({
            message: "Erro ao buscar títulos semelhantes.",
            error: error.message,
        });
        }
    }  
};
