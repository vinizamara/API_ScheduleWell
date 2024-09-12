const db = require('../db/connect');

module.exports = class financeiroController {
    // Método para obter gastos mensais de acordo com a renda
    static async gastosporMes(req, res) {
        const { fk_id_usuario } = req.params;

        if (!fk_id_usuario) {
            return res.status(400).json({ message: 'ID do usuário é necessário.' });
        }

        try {
            // 1. Consulta para obter a renda atual do usuário
            const [rendaResults] = await db.query('SELECT renda_atual FROM usuario WHERE id_usuario = ?', [fk_id_usuario]);

            if (rendaResults.length === 0) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }

            const rendaAtual = parseFloat(rendaResults[0].renda_atual); // Garantindo que renda seja numérica

            // 2. Consulta para obter as finanças do usuário apenas até a data atual
            const [financasResults] = await db.query(`
                SELECT tipo_transacao, valor, DATE_FORMAT(data, '%Y-%m') AS mes, data
                FROM financa
                WHERE fk_id_usuario = ?
                AND data <= CURDATE()  -- Filtra os registros até a data atual
                ORDER BY data ASC
            `, [fk_id_usuario]);

            if (financasResults.length === 0) {
                return res.status(404).json({ message: 'Nenhuma anotação de finanças encontrada.' });
            }

            // 3. Agrupar e calcular gastos por mês
            const gastosPorMes = financasResults.reduce((acc, { tipo_transacao, valor, mes, data }) => {
                if (!acc[mes]) {
                    // Se o mês ainda não está no acumulador, inicializamos com a renda atual
                    acc[mes] = { renda: rendaAtual, gastos: 0 };
                }
                const valorNumerico = parseFloat(valor);

                // Se for uma transação de 'Gasto', somamos ao total de gastos do mês
                if (tipo_transacao === 'Gasto') {
                    acc[mes].gastos += valorNumerico;
                }
                return acc;
            }, {});

            // 4. Criando a resposta formatada
            const resultado = Object.keys(gastosPorMes).map(mes => ({
                mes,
                renda: gastosPorMes[mes].renda,
                gastos: gastosPorMes[mes].gastos,
                saldo: gastosPorMes[mes].renda - gastosPorMes[mes].gastos
            }));

            return res.status(200).json(resultado);
        } catch (error) {
            console.error('Erro ao obter gastos por mês:', error);
            return res.status(500).json({ message: 'Erro ao obter gastos por mês.' });
        }
    }
};
