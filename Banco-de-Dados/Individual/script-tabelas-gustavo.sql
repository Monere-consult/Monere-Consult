CREATE DATABASE IF NOT EXISTS bioterio;
USE bioterio;

-- Drop na ordem inversa das dependências (quem aponta pra outra cai primeiro)
DROP TABLE IF EXISTS leitura;
DROP TABLE IF EXISTS sensor;
DROP TABLE IF EXISTS gaiola;
DROP TABLE IF EXISTS sala;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS empresa;

-- Create na ordem das dependências (quem é referenciada nasce primeiro)
CREATE TABLE empresa (
    idempresa INT PRIMARY KEY AUTO_INCREMENT,
    nome_fantasia VARCHAR(45),
    cnpj CHAR(14),
    razao_social VARCHAR(45)
);

CREATE TABLE usuario (
    idusuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45),
    cpf CHAR(11),
    email VARCHAR(45),
    senha VARCHAR(45),
    empresa_idempresa INT,
    FOREIGN KEY (empresa_idempresa) REFERENCES empresa(idempresa)
);

CREATE TABLE sala (
    idsala INT PRIMARY KEY AUTO_INCREMENT,
    temp_min DECIMAL(5,2),
    temp_max DECIMAL(5,2),
    nome_sala VARCHAR(45),
    empresa_idempresa INT,
    FOREIGN KEY (empresa_idempresa) REFERENCES empresa(idempresa)
);

CREATE TABLE gaiola (
    idgaiola INT PRIMARY KEY AUTO_INCREMENT,
    qtd_rato INT,
    sala_idsala INT,
    FOREIGN KEY (sala_idsala) REFERENCES sala(idsala)
);

CREATE TABLE sensor (
    idsensor INT PRIMARY KEY AUTO_INCREMENT,
    status TINYINT,
    gaiola_idgaiola INT,
    FOREIGN KEY (gaiola_idgaiola) REFERENCES gaiola(idgaiola)
);

CREATE TABLE leitura (
    idleitura INT PRIMARY KEY AUTO_INCREMENT,
    horario_leitura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    registro_temp DECIMAL(5,2),
    sensor_idsensor INT,
    FOREIGN KEY (sensor_idsensor) REFERENCES sensor(idsensor)
);