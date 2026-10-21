CREATE DATABASE monere_consult;
USE monere_consult;

-- MONERE CONSULT

CREATE TABLE empresa (
id INT PRIMARY KEY AUTO_INCREMENT,
razao_social VARCHAR(45) NOT NULL UNIQUE,
cnpj CHAR(14) NOT NULL UNIQUE
);

CREATE TABLE usuario (
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(100) NOT NULL,
email VARCHAR(100) NOT NULL UNIQUE,
senha VARCHAR(20) NOT NULL,
tipo_usuario VARCHAR(45) NOT NULL,
CONSTRAINT chTipo_usuario CHECK (tipo_usuario IN ('admin', 'funcionario', 'gerente')),
fk_empresa INT,
CONSTRAINT fk_empresa
FOREIGN KEY (fk_empresa)
REFERENCES empresa(id)
);

CREATE TABLE bioterio (
id INT PRIMARY KEY AUTO_INCREMENT,
cep CHAR(8) NOT NULL,
logradouro VARCHAR(70) NOT NULL,
numero INT NOT NULL UNIQUE,
complemento VARCHAR(45) NOT NULL,
fk_empresa INT NOT NULL,
CONSTRAINT fk_empresaBioterio
FOREIGN KEY (fk_empresa)
REFERENCES empresa(id)
);

CREATE TABLE sala (
id INT PRIMARY KEY AUTO_INCREMENT,
andar INT NOT NULL, 
status_ VARCHAR(20) NOT NULL,
CONSTRAINT chStatus CHECK (status_ IN ('ativo', 'inativo', 'manutenção')),
fk_bioterio INT NOT NULL,
CONSTRAINT fk_bioterio
FOREIGN KEY (fk_bioterio)
REFERENCES bioterio(id)
);

CREATE TABLE sensor(
id INT PRIMARY KEY AUTO_INCREMENT,
status_ VARCHAR(20) NOT NULL,
CONSTRAINT chEstadoSensor CHECK (status_ IN ('ativo', 'inativo', 'manutenção')),
fk_sala INT,
FOREIGN KEY (fk_sala) 
REFERENCES sala(id)
);

CREATE TABLE medidaSensor (
id INT PRIMARY KEY AUTO_INCREMENT,
temperatura DECIMAL(10,2),
momento DATETIME DEFAULT CURRENT_TIMESTAMP,
fk_sensor INT,
CONSTRAINT fk_sensor
FOREIGN KEY (fk_sensor)
REFERENCES sensor(id)
);


-- INSERTS

-- empresa
INSERT INTO empresa VALUES
(DEFAULT, 'SpTech Research', 12345678901234);

-- usuario
INSERT INTO usuario VALUES
(DEFAULT, 'Brandão','brandao@email.com','@Brandao123', 'gerente', 1),
(DEFAULT, 'Júlia', 'julia@email.com', '@Julia123','funcionario', 1);

-- bioterio 
INSERT INTO bioterio VALUES
(DEFAULT, '12345678', 'Rua Haddock Lobo', 595, 'Centro', 1);

-- sala
INSERT INTO sala VALUES
(DEFAULT, 1, 'ativo', 1);

-- sensor
INSERT INTO sensor VALUES
(DEFAULT, 'ativo', 1);

INSERT INTO sensor VALUES
(DEFAULT, 'ativo', 1);


select * from sensor;
SELECT * FROM medidaSensor;	



