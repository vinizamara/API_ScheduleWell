const bcrypt = require('bcrypt');
const db = require('../db/connect'); 

module.exports = class userController {
    // Método para cadastrar um novo usuário
    static async createUser(req, res) {
        const { nome, senha, confirmarSenha, email } = req.body;

        if (!nome || !senha || !confirmarSenha || !email) {
            return res.status(400).json({ error: 'Nome, senha, confirmação de senha e email são obrigatórios' });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).json({ error: 'As senhas não coincidem' });
        }

        if (nome.length < 3) {
            return res.status(400).json({ error: 'O nome deve ter pelo menos 3 caracteres' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }

        const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!senhaRegex.test(senha)) {
            return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números' });
        }

        try {
            // Usa db.query() diretamente, sem .promise()
            const [existingUser] = await db.query(
                'SELECT * FROM usuario WHERE email = ?', [email]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Email já está em uso' });
            }

            const hashedSenha = await bcrypt.hash(senha, 10);

            const [result] = await db.query(
                'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)', 
                [nome, email, hashedSenha]
            );

            return res.status(201).json({ message: 'Usuário criado com sucesso', userId: result.insertId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }

    static async getUsers(req, res) {
        try {
            const [results] = await db.query('SELECT id_usuario, nome, email FROM usuario');
            return res.status(200).json(results);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }

    static async updateUser(req, res) {
        const { id } = req.params;
        const { nome, email, senha } = req.body;
    
        try {
            const [existingUser] = await db.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
    
            if (existingUser.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
    
            const updates = [];
            const params = [];
    
            if (nome) {
                updates.push('nome = ?');
                params.push(nome);
            }
    
            if (email) {
                updates.push('email = ?');
                params.push(email);
            }
    
            if (senha) {
                const hashedSenha = await bcrypt.hash(senha, 10);
                updates.push('senha = ?');
                params.push(hashedSenha);
            }
    
            if (updates.length === 0) {
                return res.status(400).json({ error: 'Nenhum campo para atualizar' });
            }
    
            params.push(id);
    
            await db.query(`UPDATE usuario SET ${updates.join(', ')} WHERE id_usuario = ?`, params);
    
            return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    }    

    static async deleteUser(req, res) {
        const { id } = req.params;

        try {
            const [existingUser] = await db.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);

            if (existingUser.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

            return res.status(200).json({ message: 'Usuário deletado com sucesso' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    }

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
}
