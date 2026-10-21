CREATE DATABASE monere;
USE monere;

CREATE TABLE monere.empresa (
    id INT NOT NULL AUTO_INCREMENT,
    cnpj CHAR(14) NOT NULL,
    razao_social VARCHAR(45) NOT NULL,
    nome_fantasia VARCHAR(45) NULL,
    PRIMARY KEY (id)
);

CREATE TABLE monere.usuario (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(20) NOT NULL,
    tipo_usuario VARCHAR(45) NULL,
    fk_empresa INT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_usuario_empresa
        FOREIGN KEY (fk_empresa) REFERENCES monere.empresa (id)
);

CREATE TABLE monere.bioterio (
    id INT NOT NULL AUTO_INCREMENT,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(70) NOT NULL,
    numero INT NOT NULL,
    bairro VARCHAR(45) NULL,
    cidade VARCHAR(45) NOT NULL,
    complemento VARCHAR(45) NOT NULL,
    fk_empresa INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_bioterio_empresa
        FOREIGN KEY (fk_empresa) REFERENCES monere.empresa (id)
);

CREATE TABLE monere.sala (
    id INT NOT NULL AUTO_INCREMENT,
    andar INT NOT NULL,
    status_ VARCHAR(20) NULL,
    fk_bioterio INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_sala_bioterio
        FOREIGN KEY (fk_bioterio) REFERENCES monere.bioterio (id)
);

CREATE TABLE monere.gaiola (
    id INT NOT NULL AUTO_INCREMENT,
    fk_sala INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_gaiola_sala
        FOREIGN KEY (fk_sala) REFERENCES monere.sala (id)
);

CREATE TABLE monere.sensor (
    id INT NOT NULL AUTO_INCREMENT,
    num_serie INT NULL,
    status_ VARCHAR(20) NULL,
    fk_gaiola INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_sensor_gaiola UNIQUE (fk_gaiola),
    CONSTRAINT fk_sensor_gaiola
        FOREIGN KEY (fk_gaiola) REFERENCES monere.gaiola (id)
);

CREATE TABLE monere.medida (
    id INT NOT NULL AUTO_INCREMENT,
    num_serie VARCHAR(45) NULL,
    temperatura DECIMAL(3,2) NOT NULL,
    momento DATETIME NOT NULL,
    fk_sensor INT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_medida_sensor
        FOREIGN KEY (fk_sensor) REFERENCES monere.sensor (id)
);