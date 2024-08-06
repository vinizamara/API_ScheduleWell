const bcrypt = require('bcrypt');
const db = require('../db/connect');

module.exports = class userController {
    //Cadastrar Usuário
    static async createUser(req, res) {
        const { nome, senha, email } = req.body;

        // Verificar se todos os campos necessários estão presentes
        if (!nome || !senha || !email) {
            return res.status(400).json({ error: 'Nome, senha e email são obrigatórios' });
        }

        try {
            // Verificar se o email já está em uso
            const [existingUser] = await db.promise().query(
                'SELECT * FROM usuario WHERE email = ?', [email]
            );

            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Email já está em uso' });
            }

            // Hash da senha
            const hashedSenha = await bcrypt.hash(senha, 10);

            // Inserir novo usuário no banco de dados
            const [result] = await db.promise().query(
                'INSERT INTO usuario (nome, email, senha) VALUES (?, ?, ?)', 
                [nome, email, hashedSenha]
            );

            // Retornar sucesso
            return res.status(201).json({ message: 'Usuário criado com sucesso', userId: result.insertId });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }

    //Listar Usuários
    static async getUsers(req, res) {
        try {
            const [results] = await db.promise().query('SELECT id_usuario, nome, email FROM usuario');
            return res.status(200).json(results);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao listar usuários' });
        }
    }

    //Atualizar Usuários
    static async updateUser(req, res) {
        const { id } = req.params;
        const { nome, email, senha } = req.body;

        try {
            const [existingUser] = await db.promise().query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);

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

            await db.promise().query(`UPDATE usuario SET ${updates.join(', ')} WHERE id_usuario = ?`, params);

            return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    }

    //Deletar Usuários
    static async deleteUser(req, res) {
        const { id } = req.params;

        try {
            const [existingUser] = await db.promise().query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);

            if (existingUser.length === 0) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }

            await db.promise().query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

            return res.status(200).json({ message: 'Usuário deletado com sucesso' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    }
}

