const db = require("../db/connect");
const moment = require("moment"); // Utilizando moment.js para trabalhar com datas

module.exports = class financeiroController {
  // Método para obter a renda atual
  static async obterRendaAtual(req, res) {
    const { fk_id_usuario } = req.params;

    if (!fk_id_usuario) {
      return res.status(400).json({ message: "ID do usuário é necessário." });
    }

    try {
      const [financasResults] = await db.query(
        `
          SELECT tipo_transacao, SUM(valor) as total
          FROM financa
          WHERE fk_id_usuario = ?
          GROUP BY tipo_transacao
        `,
        [fk_id_usuario]
      );

      if (financasResults.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma transação encontrada." });
      }

      let totalGastos = 0;
      let totalGanhos = 0;

      financasResults.forEach(({ tipo_transacao, total }) => {
        if (tipo_transacao === "Gasto") {
          totalGastos += parseFloat(total);
        } else if (tipo_transacao === "Ganho") {
          totalGanhos += parseFloat(total);
        }
      });

      const saldo = totalGanhos - totalGastos;

      return res.status(200).json({ renda_atual: saldo });
    } catch (error) {
      console.error("Erro ao obter saldo como renda atual:", error);
      return res
        .status(500)
        .json({
          message: "Erro ao obter saldo como renda atual.",
          error: error.message,
        });
    }
  }

  // Método para atualizar a renda do usuário
  static async atualizarRenda(req, res) {
    const { fk_id_usuario } = req.params;
    const { novaRenda } = req.body;

    if (!fk_id_usuario || novaRenda === undefined) {
      return res
        .status(400)
        .json({ message: "ID do usuário e nova renda são necessários." });
    }

    try {
      await db.query(
        `UPDATE usuario SET renda_atual = ? WHERE id_usuario = ?`,
        [novaRenda, fk_id_usuario]
      );

      return res.status(200).json({ message: "Renda atualizada com sucesso." });
    } catch (error) {
      console.error("Erro ao atualizar renda:", error);
      return res
        .status(500)
        .json({ message: "Erro ao atualizar renda.", error: error.message });
    }
  }

  // Método para obter resumo financeiro: gastos, ganhos e saldo
  static async resumoFinanceiro(req, res) {
    const { fk_id_usuario } = req.params;

    if (!fk_id_usuario) {
      return res.status(400).json({ message: "ID do usuário é necessário." });
    }

    try {
      const [financasResults] = await db.query(
        `
          SELECT tipo_transacao, SUM(valor) as total
          FROM financa
          WHERE fk_id_usuario = ?
          GROUP BY tipo_transacao
        `,
        [fk_id_usuario]
      );

      if (financasResults.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma transação encontrada." });
      }

      let totalGastos = 0;
      let totalGanhos = 0;

      financasResults.forEach(({ tipo_transacao, total }) => {
        if (tipo_transacao === "Gasto") {
          totalGastos += parseFloat(total);
        } else if (tipo_transacao === "Ganho") {
          totalGanhos += parseFloat(total);
        }
      });

      const saldo = totalGanhos - totalGastos;

      return res.status(200).json({
        ganhos: totalGanhos,
        gastos: totalGastos,
        saldo: saldo,
        renda_atual: saldo,
      });
    } catch (error) {
      console.error("Erro ao obter resumo financeiro:", error);
      return res
        .status(500)
        .json({
          message: "Erro ao obter resumo financeiro.",
          error: error.message,
        });
    }
  }

  // Método para obter todas as transações em um único endpoint, incluindo lógica de diária, semanal, mensal e anual
  static async transacoes(req, res) {
    const { fk_id_usuario } = req.params;

    if (!fk_id_usuario) {
      return res.status(400).json({ message: "ID do usuário é necessário." });
    }

    try {
      // Obter todas as transações do banco de dados
      const [transacoes] = await db.query(
        `
          SELECT *
          FROM financa
          WHERE fk_id_usuario = ?
          ORDER BY 
            CASE 
              WHEN frequencia = 'Única' THEN 1
              WHEN frequencia = 'Diária' THEN 2
              WHEN frequencia = 'Semanal' THEN 3
              WHEN frequencia = 'Mensal' THEN 4
              WHEN frequencia = 'Anual' THEN 5
              ELSE 6
            END
        `,
        [fk_id_usuario]
      );

      if (transacoes.length === 0) {
        return res.status(404).json({ message: "Nenhuma transação encontrada." });
      }

      const transacoesFinal = [];

      transacoes.forEach((transacao) => {
        const dataInicio = moment(transacao.data_inicio); // Supondo que a coluna data_inicio exista
        const dataAtual = moment();

        // Para transações que só devem ocorrer futuramente
        let proximaDataTransacao;

        if (transacao.frequencia === 'Diária') {
          // Calcular próxima data para transações diárias
          const diasDiferenca = dataAtual.diff(dataInicio, 'days');
          if (diasDiferenca >= 0) {
            proximaDataTransacao = dataInicio.clone().add(diasDiferenca, 'days');
          }
        } else if (transacao.frequencia === 'Semanal') {
          // Calcular próxima data para transações semanais
          const semanasDiferenca = Math.floor(dataAtual.diff(dataInicio, 'weeks'));
          proximaDataTransacao = dataInicio.clone().add(semanasDiferenca, 'weeks');

          if (dataAtual.isAfter(proximaDataTransacao, 'day')) {
            proximaDataTransacao = proximaDataTransacao.add(1, 'week');
          }
        } else if (transacao.frequencia === 'Mensal') {
          // Calcular próxima data para transações mensais
          proximaDataTransacao = dataInicio.clone();
          while (proximaDataTransacao.isBefore(dataAtual, 'day')) {
            proximaDataTransacao = proximaDataTransacao.add(1, 'month');
            const ultimoDiaMes = proximaDataTransacao.endOf('month').date();
            if (proximaDataTransacao.date() > ultimoDiaMes) {
              proximaDataTransacao.date(ultimoDiaMes);
            }
          }
        } else if (transacao.frequencia === 'Anual') {
          // Calcular próxima data para transações anuais
          proximaDataTransacao = dataInicio.clone();
          while (proximaDataTransacao.isBefore(dataAtual, 'day')) {
            proximaDataTransacao = proximaDataTransacao.add(1, 'year');
            const ultimoDiaMes = proximaDataTransacao.endOf('month').date();
            if (proximaDataTransacao.date() > ultimoDiaMes) {
              proximaDataTransacao.date(ultimoDiaMes);
            }
          }
        } else {
          // Transações únicas ou outras frequências não processadas
          proximaDataTransacao = dataInicio;
        }

        // Verifica se a próxima transação deve ocorrer hoje
        if (dataAtual.isSame(proximaDataTransacao, 'day')) {
          transacoesFinal.push({
            ...transacao,
            data_gerada: dataAtual.format('YYYY-MM-DD'),
          });
        }
      });

      return res.status(200).json({ transacoes: transacoesFinal });
    } catch (error) {
      console.error("Erro ao obter transações:", error);
      return res.status(500).json({ message: "Erro ao obter transações.", error: error.message });
    }
  }
};