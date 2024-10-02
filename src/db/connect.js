const mysql = require('mysql2/promise')

const pool = mysql.createPool({
    connectionLimit:10,
    host: 'db', // Mude para seu host
    user: 'root', // Mude para seu user
    password: 'root', // Mude para sua senha
    database: 'schedulewell' // Mude para sua tabela
})

module.exports = pool
