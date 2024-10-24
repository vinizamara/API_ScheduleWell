const db = require("../db/connect");
const moment = require("moment"); // Utilizando moment.js para trabalhar com datas

module.exports = class financeiroController {
  // Método para obter a renda atual
  static async obterRendaTotal(req, res) {
    const { fk_id_usuario } = req.params;
  
    if (!fk_id_usuario) {
      return res.status(400).json({ message: "ID do usuário é necessário." });
    }
  
    try {
      const [financasResults] = await db.query(
        `
          SELECT tipo_transacao, valor, frequencia, data
          FROM financa
          WHERE fk_id_usuario = ?
        `,
        [fk_id_usuario]
      );
  
      if (financasResults.length === 0) {
        return res
          .status(404)
          .json({ message: "Nenhuma transação encontrada." });
      }
  
      let totalDespesa = 0;
      let totalReceita = 0;
  
      const dataAtual = moment(); // Usando moment.js para manipular datas
  
      financasResults.forEach(({ tipo_transacao, valor, frequencia, data }) => {
        const dataInicio = moment(data);
  
        switch (frequencia) {
          case "Diaria":
            // Conta a quantidade de dias desde a data de início até hoje
            const diasDiferenca = dataAtual.diff(dataInicio, 'days') + 1; // +1 para incluir o dia atual
            if (tipo_transacao === "Despesa") {
              totalDespesa += parseFloat(valor) * diasDiferenca;
            } else if (tipo_transacao === "Receita") {
              totalReceita += parseFloat(valor) * diasDiferenca;
            }
            break;
  
          case "Semanal":
            const semanasDiferenca = Math.floor(dataAtual.diff(dataInicio, 'weeks'));
            if (semanasDiferenca >= 0) {
              if (tipo_transacao === "Despesa") {
                totalDespesa += parseFloat(valor) * (semanasDiferenca + 1); // +1 para incluir a semana atual
              } else if (tipo_transacao === "Receita") {
                totalReceita += parseFloat(valor) * (semanasDiferenca + 1);
              }
            }
            break;
  
          case "Mensal":
            const mesesDiferenca = Math.floor(dataAtual.diff(dataInicio, 'months'));
            if (mesesDiferenca >= 0) {
              if (tipo_transacao === "Despesa") {
                totalDespesa += parseFloat(valor) * (mesesDiferenca + 1); // +1 para incluir o mês atual
              } else if (tipo_transacao === "Receita") {
                totalReceita += parseFloat(valor) * (mesesDiferenca + 1);
              }
            }
            break;
  
          case "Anual":
            const anosDiferenca = Math.floor(dataAtual.diff(dataInicio, 'years'));
            if (anosDiferenca >= 0) {
              if (tipo_transacao === "Despesa") {
                totalDespesa += parseFloat(valor) * (anosDiferenca + 1); // +1 para incluir o ano atual
              } else if (tipo_transacao === "Receita") {
                totalReceita += parseFloat(valor) * (anosDiferenca + 1);
              }
            }
            break;
  
          default:
            // Para transações únicas ou não reconhecidas
            if (tipo_transacao === "Despesa") {
              totalDespesa += parseFloat(valor);
            } else if (tipo_transacao === "Receita") {
              totalReceita += parseFloat(valor);
            }
            break;
        }
      });
  
      const saldo = totalReceita - totalDespesa;
  
      return res.status(200).json({ renda_total: saldo });
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
  

  // Método para obter resumo financeiro: Despesa, Receita e saldo
  static async resumoFinanceiro(req, res) {
    const { fk_id_usuario } = req.params;

    if (!fk_id_usuario) {
      return res.status(400).json({ message: "ID do usuário é necessário." });
    }

    try {
      // Obter todas as transações do banco de dados para o mês atual
      const [financasResults] = await db.query(
        `
          SELECT tipo_transacao, valor, data, frequencia
          FROM financa
          WHERE fk_id_usuario = ? 
            AND MONTH(data) = MONTH(CURRENT_DATE) 
            AND YEAR(data) = YEAR(CURRENT_DATE)
        `,
        [fk_id_usuario]
      );

      if (financasResults.length === 0) {
        return res.status(404).json({ message: "Nenhuma transação encontrada." });
      }

      let totalDespesa = 0;
      let totalReceita = 0;
      const dataAtual = moment();

      financasResults.forEach(({ tipo_transacao, valor, data, frequencia }) => {
        const dataInicio = moment(data);
        let contagem = 0;

        // Calcular a contagem com base na frequência usando switch case
        switch (frequencia) {
          case 'Diaria':
            const diasDiferenca = dataAtual.diff(dataInicio, 'days');
            contagem = diasDiferenca + 1; // +1 para incluir o dia de início
            break;

          case 'Semanal':
            const semanasDiferenca = Math.floor(dataAtual.diff(dataInicio, 'weeks'));
            contagem = semanasDiferenca + 1; // +1 para incluir a primeira semana
            break;

          case 'Mensal':
            const mesesDiferenca = Math.floor(dataAtual.diff(dataInicio, 'months'));
            contagem = mesesDiferenca + 1; // +1 para incluir o primeiro mês
            break;

          case 'Anual':
            const anosDiferenca = Math.floor(dataAtual.diff(dataInicio, 'years'));
            contagem = anosDiferenca + 1; // +1 para incluir o primeiro ano
            break;

          default:
            contagem = 1; // Para transações únicas ou outras frequências não especificadas
            break;
        }

        // Somar os valores de acordo com a contagem
        if (tipo_transacao === "Despesa") {
          totalDespesa += parseFloat(valor) * contagem;
        } else if (tipo_transacao === "Receita") {
          totalReceita += parseFloat(valor) * contagem;
        }
      });

      const saldo = totalReceita - totalDespesa;

      return res.status(200).json({
        Receita: totalReceita,
        Despesa: totalDespesa,
        saldo: saldo,
      });
    } catch (error) {
      console.error("Erro ao obter resumo financeiro:", error);
      return res.status(500).json({
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
              WHEN frequencia = 'Unica' THEN 1
              WHEN frequencia = 'Diaria' THEN 2
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

        if (transacao.frequencia === 'Diaria') {
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