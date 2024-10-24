const bcrypt = require('bcrypt');
const db = require('../db/connect'); // Certifique-se de que este caminho está correto

module.exports = class UserController {
    // Método para cadastrar um novo usuário
    static async createUser(req, res) {
        const { nome, senha, confirmarSenha, email } = req.body;

        // Validações de campos obrigatórios
        if (!nome || !senha || !confirmarSenha || !email) {
            return res.status(400).json({ error: 'É necessário preencher todos os campos' });
        }

        // Verifica se as senhas coincidem
        if (senha !== confirmarSenha) {
            return res.status(400).json({ error: 'As senhas não coincidem' });
        }

        // Verifica o comprimento do nome
        if (nome.length < 3) {
            return res.status(400).json({ error: 'O nome deve ter pelo menos 3 caracteres' });
        }

        // Verifica o formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Formato de email inválido' });
        }

        // Valida a força da senha
        const senhaRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!senhaRegex.test(senha)) {
            return res.status(400).json({ error: 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números' });
        }

        try {
            // Verifica se o email já está em uso
            const [existingUser] = await db.query('SELECT * FROM usuario WHERE email = ?', [email]);
            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Já existe um usuário com esse e-mail' });
            }

            // Cria o hash da senha
            const hashedSenha = await bcrypt.hash(senha, 10);

            // Insere o novo usuário no banco de dados
            const [result] = await db.query('INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hashedSenha]);

            return res.status(201).json({ message: 'Usuário criado com sucesso', userId: result.insertId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }

    // Método para listar todos os usuários
    static async getUsers(req, res) {
        try {
            const [results] = await db.query('SELECT id_usuario, nome, email FROM usuario');
            return res.status(200).json(results);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }

    // Método para atualizar usuário
    static async updateUser(req, res) {
        const { id } = req.params;
        const { nome, email, senha } = req.body;

        try {
            // Verifica se o usuário existe
            const [existingUser] = await db.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
            if (existingUser.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            const updates = [];
            const params = [];

            // Atualiza o nome se fornecido
            if (nome) {
                updates.push('nome = ?');
                params.push(nome);
            }

            // Verifica se o e-mail já está em uso por outro usuário
            if (email) {
                const [existingEmail] = await db.query('SELECT * FROM usuario WHERE email = ? AND id_usuario != ?', [email, id]);
                if (existingEmail.length > 0) {
                    return res.status(400).json({ error: 'E-mail já está em uso por outro usuário' });
                }
                updates.push('email = ?'); // Atualiza o email se não houver conflito
                params.push(email);
            }

            // Atualiza a senha se fornecida
            if (senha) {
                const hashedSenha = await bcrypt.hash(senha, 10);
                updates.push('senha = ?');
                params.push(hashedSenha);
            }

            // Verifica se há atualizações
            if (updates.length === 0) {
                return res.status(400).json({ error: 'Nenhum campo para atualizar' });
            }

            params.push(id);

            // Executa a atualização no banco de dados
            await db.query(`UPDATE usuario SET ${updates.join(', ')} WHERE id_usuario = ?`, params);

            return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    }

    // Método para deletar usuário
    static async deleteUser(req, res) {
        const { id } = req.params;

        try {
            // Verifica se o usuário existe
            const [existingUser] = await db.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
            if (existingUser.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Deleta o usuário
            await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

            return res.status(200).json({ message: 'Conta deletada com sucesso' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    }

    // Método para login
    static async postLogin(req, res) {
        const { email, senha } = req.body;

        // Verifica se email e senha foram fornecidos
        if (!email || !senha) {
          return res.status(400).json({ error: 'É necessário preencher todos os campos' });
        }

        const query = 'SELECT * FROM usuario WHERE email = ?';

        try {
            // Busca o usuário pelo email
            const [results] = await db.query(query, [email]);

            // Verifica se o usuário foi encontrado
            if (results.length === 0) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const user = results[0];

            // Compara a senha fornecida com o hash no banco de dados
            const isPasswordValid = await bcrypt.compare(senha, user.senha);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            // Login bem-sucedido
            return res.status(200).json({ message: 'Login realizado com sucesso', user });
        } catch (error) {
            console.error('Erro ao executar a consulta:', error);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};
