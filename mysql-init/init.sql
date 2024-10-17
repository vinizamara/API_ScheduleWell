-- init.sql

-- criação da tabela de usuario
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    renda_atual DECIMAL(10, 2)
);

-- criação da tabela de financa
CREATE TABLE financa (
    id_financa INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_usuario INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data DATE NOT NULL,
    tipo_transacao ENUM('Gasto', 'Ganho') NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    frequencia ENUM('Unica', 'Diaria', 'Semanal', 'Mensal', 'Anual') NOT NULL,
    FOREIGN KEY (fk_id_usuario) REFERENCES usuario(id_usuario)
);

-- criação da tabela de anotacao
CREATE TABLE anotacao (
    id_anotacao INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_usuario INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    FOREIGN KEY (fk_id_usuario) REFERENCES usuario(id_usuario)
);

-- criação da tabela de checklist
CREATE TABLE checklist (
    id_checklist INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_usuario INT NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    FOREIGN KEY (fk_id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE item_checklist (
    id_item_checklist INT AUTO_INCREMENT PRIMARY KEY,
    fk_id_checklist INT NOT NULL,
    texto VARCHAR(255) NOT NULL,
    concluido BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (fk_id_checklist) REFERENCES checklist(id_checklist)
);