const bcrypt = require('bcrypt'); // Importa a biblioteca bcrypt para hashear senhas.
const db = require('../db/connect'); // Importa o módulo de conexão com o banco de dados.

module.exports = class userController {
    // Método para cadastrar um novo usuário
    static async createUser(req, res) {
        const { nome, senha, email } = req.body; // Extrai nome, senha e email do corpo da requisição.

        // Verifica se todos os campos obrigatórios estão presentes.
        if (!nome || !senha || !email) {
            return res.status(400).json({ error: 'Nome, senha e email são obrigatórios' });
        }

        try {
            // Verifica se o email já está em uso consultando o banco de dados.
            const [existingUser] = await db.promise().query(
                'SELECT * FROM usuario WHERE email = ?', [email]
            );

            // Se o email já estiver cadastrado, retorna um erro.
            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Email já está em uso' });
            }

            // Gera um hash da senha para armazenamento seguro.
            const hashedSenha = await bcrypt.hash(senha, 10);

            // Insere o novo usuário no banco de dados com o nome, email e senha hasheada.
            const [result] = await db.promise().query(
                'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)', 
                [nome, email, hashedSenha]
            );

            // Retorna uma resposta de sucesso com o ID do novo usuário.
            return res.status(201).json({ message: 'Usuário criado com sucesso', userId: result.insertId });
        } catch (error) {
            console.error(error); // Loga o erro no console para depuração.
            return res.status(500).json({ error: 'Erro ao criar usuário' }); // Retorna um erro genérico de servidor.
        }
    }

    // Método para listar todos os usuários
    static async getUsers(req, res) {
        try {
            // Consulta o banco de dados para obter todos os usuários com seus ID, nome e email.
            const [results] = await db.promise().query('SELECT id_usuario, nome, email FROM usuario');
            return res.status(200).json(results); // Retorna a lista de usuários.
        } catch (error) {
            console.error(error); // Loga o erro no console para depuração.
            return res.status(500).json({ error: 'Erro ao listar usuários' }); // Retorna um erro genérico de servidor.
        }
    }

    // Método para atualizar um usuário existente
    static async updateUser(req, res) {
        const { id } = req.params; // Extrai o ID do usuário dos parâmetros da URL.
        const { nome, email, senha } = req.body; // Extrai nome, email e senha do corpo da requisição.

        try {
            // Verifica se o usuário existe consultando o banco de dados.
            const [existingUser] = await db.promise().query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);

            // Se o usuário não for encontrado, retorna um erro.
            if (existingUser.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Arrays para armazenar os campos a serem atualizados e os respectivos valores.
            const updates = [];
            const params = [];

            // Se o nome foi fornecido, adiciona-o à lista de atualizações.
            if (nome) {
                updates.push('nome = ?');
                params.push(nome);
            }

            // Se o email foi fornecido, adiciona-o à lista de atualizações.
            if (email) {
                updates.push('email = ?');
                params.push(email);
            }

            // Se a senha foi fornecida, hashea-a e adiciona-a à lista de atualizações.
            if (senha) {
                const hashedSenha = await bcrypt.hash(senha, 10);
                updates.push('senha = ?');
                params.push(hashedSenha);
            }

            // Se nenhum campo foi fornecido para atualização, retorna um erro.
            if (updates.length === 0) {
                return res.status(400).json({ error: 'Nenhum campo para atualizar' });
            }

            params.push(id); // Adiciona o ID do usuário aos parâmetros para a query SQL.

            // Executa a query de atualização no banco de dados.
            await db.promise().query(`UPDATE usuario SET ${updates.join(', ')} WHERE id_usuario = ?`, params);

            // Retorna uma resposta de sucesso.
            return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
        } catch (error) {
            console.error(error); // Loga o erro no console para depuração.
            return res.status(500).json({ error: 'Erro ao atualizar usuário' }); // Retorna um erro genérico de servidor.
        }
    }

    // Método para deletar um usuário existente
    static async deleteUser(req, res) {
        const { id } = req.params; // Extrai o ID do usuário dos parâmetros da URL.

        try {
            // Verifica se o usuário existe consultando o banco de dados.
            const [existingUser] = await db.promise().query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);

            // Se o usuário não for encontrado, retorna um erro.
            if (existingUser.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            // Deleta o usuário do banco de dados.
            await db.promise().query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

            // Retorna uma resposta de sucesso.
            return res.status(200).json({ message: 'Usuário deletado com sucesso' });
        } catch (error) {
            console.error(error); // Loga o erro no console para depuração.
            return res.status(500).json({ error: 'Erro ao deletar usuário' }); // Retorna um erro genérico de servidor.
        }
    }
}
