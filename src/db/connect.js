const mysql = require('mysql2')

const pool = mysql.createPool({
    connectionLimit:10,
    host: 'localhost', // Mude para seu host
    user: 'alunods', // Mude para seu user
    password: 'senai@604', // Mude para sua senha
    database: 'teste' // Mude para sua tabela
})

module.exports = pool
