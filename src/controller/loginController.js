const bcrypt = require('bcrypt');
const db = require('../db/connect'); // Importa o módulo de conexão com o banco de dados

module.exports = class LoginController {
  static async postLogin(req, res) {
    const { email, senha } = req.body;

    // Verifica se email e senha foram fornecidos
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const query = 'SELECT * FROM usuario WHERE email = ?';

    try {
      // Executa a consulta para encontrar o usuário pelo email
      const [results] = await db.query(query, [email]);

      // Verifica se o usuário foi encontrado
      if (results.length === 0) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const user = results[0];

      // Compara a senha fornecida com a senha armazenada no banco de dados
      const isPasswordValid = await bcrypt.compare(senha, user.senha);

      // Log para depuração
      console.log('Senha fornecida:', senha);
      console.log('Senha armazenada (hash):', user.senha);
      console.log('Senha válida:', isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Retorna uma resposta de sucesso com os dados do usuário
      return res.status(200).json({ message: 'Login realizado com sucesso', user });
    } catch (error) {
      console.error('Erro ao executar a consulta:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};
