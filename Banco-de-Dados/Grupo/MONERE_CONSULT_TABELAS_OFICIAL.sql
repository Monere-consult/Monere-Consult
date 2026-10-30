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
senha VARCHAR(45) NOT NULL,
tipo_usuario VARCHAR(20) CONSTRAINT chTipo_usuario CHECK (tipo_usuario IN ('admin', 'funcionario', 'gerente')),
fk_empresa INT,
fk_gerente INT,
CONSTRAINT fk_empresa
FOREIGN KEY (fk_empresa)
REFERENCES empresa(id),
CONSTRAINT (fk_gerente)
FOREIGN KEY (fk_gerente)
REFERENCES usuario(id)
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
status_ VARCHAR(20) NOT NULL CONSTRAINT chStatus CHECK (status_ IN ('ativo', 'inativo', 'manutenção')),
fk_bioterio INT NOT NULL,
CONSTRAINT fk_bioterio
FOREIGN KEY (fk_bioterio)
REFERENCES bioterio(id)
);

CREATE TABLE salaSensor(
id INT PRIMARY KEY AUTO_INCREMENT,
status_ VARCHAR(20) NOT NULL CONSTRAINT chEstadoSensor CHECK (status_ IN ('ativo', 'inativo', 'manutenção')),
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

INSERT INTO empresa VALUES 
(DEFAULT, 'Instituto Butantan', 43210987654321);



-- usuario
INSERT INTO usuario VALUES
(DEFAULT, 'Brandão','brandao.corporativo@gmail.com','@Rotina123', 'gerente', 1),
(DEFAULT, 'Júlia', 'julia.corporativo@gmail.com', '@RotasControlesModulo123','gerente', 1),
(DEFAULT, 'Marcos Antônio', 'marcos.corporativo@gmail.com','@Escopo123', 'funcionario', 2),
(DEFAULT, 'Levi Greb', 'levi.corporativo@gmail.com', '@Katana0', 'admin', NULL);

DESCRIBE usuario;

-- bioterio 
INSERT INTO bioterio VALUES
(DEFAULT, '12345678', 'Rua Haddock Lobo', 595, 'Centro', 1),
(DEFAULT, '78654321', 'Rua Agrimensor Sugaya', 930, 'Leste', 1),
(DEFAULT, '23458690', 'Avenida Elisio Teixeira Leite', 5097, 'Norte', 2),
(DEFAULT, '15273890', 'Rua Carlos Bigatti', 44, 'Leste', 2);

-- sala
INSERT INTO sala VALUES
(DEFAULT, 1, 'ativo', 1),
(DEFAULT, 2, 'Ativo', 2),
(DEFAULT, 3, 'Manutenção', 3),
(DEFAULT, 4, 'Inativo', 4);

-- salaSensor
INSERT INTO salaSensor VALUES
(DEFAULT, 'Ativo', 1),
(DEFAULT, 'Ativo', 2);

