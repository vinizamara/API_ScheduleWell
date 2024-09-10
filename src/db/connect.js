const mysql = require('mysql2/promise')

const pool = mysql.createPool({
    connectionLimit:10,
    host: 'localhost', // Mude para seu host
    user: 'alunods', // Mude para seu user
    password: 'senai@604', // Mude para sua senha
    database: 'schedulewell' // Mude para sua tabela
})

module.exports = pool
