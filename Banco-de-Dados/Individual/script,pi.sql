CREATE DATABASE monere_consult;
USE monere_consult;


CREATE TABLE empresa (
id INT PRIMARY KEY AUTO_INCREMENT,
razao_social VARCHAR(45) NOT NULL,
cnpj CHAR(14) NOT NULL UNIQUE
);

CREATE TABLE usuario (
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
senha VARCHAR(20) NOT NULL,
cargo VARCHAR(45) NOT NULL CONSTRAINT chCargo CHECK (cargo IN ('admin', 'funcionario', 'gerente')),
fk_empresa INT,
CONSTRAINT fk_empresa
FOREIGN KEY (fk_empresa)
REFERENCES empresa(id)
);


CREATE TABLE sala (
id INT PRIMARY KEY AUTO_INCREMENT,
andar INT NOT NULL, 
estado VARCHAR(20) NOT NULL CONSTRAINT chEstado CHECK (estado IN ('ativo', 'inativo', 'manutenção')),
fk_empresa INT NOT NULL,
CONSTRAINT fk_empresaSala
FOREIGN KEY (fk_empresa)
REFERENCES empresa(id)
);

CREATE TABLE gaiola (
id INT PRIMARY KEY AUTO_INCREMENT,
qtd_animais INT,
fk_sala INT NOT NULL,
CONSTRAINT fk_sala
FOREIGN KEY (fk_sala)
REFERENCES sala(id),
fk_sensor INT,
CONSTRAINT fk_sensor
FOREIGN KEY (fk_sensor)
REFERENCES sensor(id)
);

CREATE TABLE sensor(
id INT PRIMARY KEY AUTO_INCREMENT,
estado VARCHAR(20) NOT NULL CONSTRAINT chEstadoSensor CHECK (estado IN ('ativo', 'inativo', 'manutenção'))
);

CREATE TABLE captura (
id INT PRIMARY KEY AUTO_INCREMENT,
temperatura DECIMAL(3,2),
fk_sensor INT,
CONSTRAINT fk_sensor
FOREIGN KEY (fk_sensor)
REFERENCES sensor(id)
);
