const connect = require("../db/connect"); // conexão com o banco

module.exports = class LoginController {
    static async postLogin(req, res) {
        const { email, senha } = req.body;
    
        if (!email || !senha) {
          return res.status(400).json({ error: "Email e Senha são obrigatórios" });
        }
    
        const query = `SELECT * FROM Usuario WHERE email = '${email}' AND Senha = '${senha}'`;
    
        try {
          connect.query(query, function (err, results) {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "Erro interno do servidor" });
            }
    
            if (results.length === 0) {
              return res.status(401).json({ error: "Credenciais inválidas" });
            }
    
            return res.status(200).json({ message: "Login realizado com sucesso", user: results[0] });
          });
        } catch (error) {
          console.error("Erro ao executar a consulta:", error);
          return res.status(500).json({ error: "Erro interno do servidor" });
        }
      }    
};
