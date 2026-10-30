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
CONSTRAINT fk_gerente
FOREIGN KEY (fk_gerente)
REFERENCES usuario(id)
);


CREATE TABLE bioterio (
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(100) NOT NULL,
cep CHAR(8) NOT NULL,
logradouro VARCHAR(70) NOT NULL,
numero INT NOT NULL,
complemento VARCHAR(45),
fk_empresa INT NOT NULL,
CONSTRAINT fk_empresaBioterio
FOREIGN KEY (fk_empresa)
REFERENCES empresa(id)
);

CREATE TABLE sala (
id INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(45) NOT NULL,
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
fk_sala INT NOT NULL,
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
REFERENCES salaSensor(id)
);

-- INSERTS

-- empresa
INSERT INTO empresa VALUES
(DEFAULT, 'SpTech Research', 12345678901234), 
(DEFAULT, 'Instituto Butantan', 43210987654321);



-- usuario
INSERT INTO usuario VALUES
(DEFAULT, 'Brandão', 'brandao.corporativo@gmail.com', '@Rotina123', 'gerente', 1, NULL),
(DEFAULT, 'Júlia', 'julia.corporativo@gmail.com', '@RotasControlesModulo123', 'gerente', 1, NULL),
(DEFAULT, 'Marcos Antônio', 'marcos.corporativo@gmail.com', '@Escopo123', 'funcionario', 2, 1),
(DEFAULT, 'Levi Greb', 'levi.administrador@gmail.com', '@Katana0', 'admin', NULL, NULL);

-- bioterio 
INSERT INTO bioterio (nome, cep, logradouro, numero, complemento, fk_empresa) VALUES
('Paulista',  '12345678', 'Rua Haddock Lobo', 595, 'Centro', 1),
('Leste I',  '78654321', 'Rua Agrimensor Sugaya', 930, 'Leste', 1),
('Norte',    '23458690', 'Avenida Elisio Teixeira Leite', 5097, 'Norte', 2),
('Leste II', '15273890', 'Rua Carlos Bigatti', 44, 'Leste', 2);

-- sala
INSERT INTO sala VALUES
(DEFAULT, 'Sala 1', 1, 'ativo', 1),
(DEFAULT, 'Sala 2', 2, 'ativo', 2),
(DEFAULT, 'Sala 3', 3, 'manutenção', 3),
(DEFAULT, 'Sala 4', 4, 'inativo', 4);

-- salaSensor
INSERT INTO salaSensor VALUES
(DEFAULT, 'ativo', 1),
(DEFAULT, 'ativo', 2),
(DEFAULT, 'manutenção', 3),
(DEFAULT, 'inativo', 4);

-- SELECTS 

-- Gráfico de barras: temperatura mais recente de cada sala
SELECT sa.nome AS sala, m.temperatura
FROM medidaSensor m
INNER JOIN salaSensor ss ON m.fk_sensor = ss.id
INNER JOIN sala sa ON ss.fk_sala = sa.id
LEFT JOIN medidaSensor m2 
ON m2.fk_sensor = m.fk_sensor
AND m2.momento > m.momento -- aqui pega a mais recente(se acharem um jeito desse select ficar mais facil, podem mudar)
WHERE sa.fk_bioterio = 1
AND m2.id IS NULL
ORDER BY sa.id;

-- KPI Fora de faixa (parte "1" do 1/5): salas com a última medida fora de 20-26
SELECT COUNT(DISTINCT sa.id) AS salas_fora_da_faixa
FROM medidaSensor m
INNER JOIN salaSensor ss ON m.fk_sensor = ss.id
INNER JOIN sala sa ON ss.fk_sala = sa.id
WHERE sa.fk_bioterio = 1
AND m.momento >= NOW() - INTERVAL 5 MINUTE -- Essa linha filtra as medidas pelo horário, e mantém só os dos últimos 5 minutos
AND (m.temperatura > 26 OR m.temperatura < 20);

-- Total de salas (parte "5" do 1/5)
SELECT COUNT(*) AS total_salas
FROM sala
WHERE fk_bioterio = 1;

-- KPI Sensores online (parte "5" do 5/5): sensores que enviaram medida nos últimos 5 minutos
SELECT COUNT(DISTINCT m.fk_sensor) AS sensores_online
FROM medidaSensor m
INNER JOIN salaSensor ss ON m.fk_sensor = ss.id
INNER JOIN sala sa ON ss.fk_sala = sa.id
WHERE sa.fk_bioterio = 1
AND m.momento >= NOW() - INTERVAL 5 MINUTE; -- Essa linha filtra as medidas pelo horário, e mantém só os dos últimos 5 minutos

-- KPI Pico de excursão: maior temperatura das últimas 24h e quanto passou do limite (26)
SELECT MAX(m.temperatura) AS pico,
       MAX(m.temperatura) - 26 AS acima_do_limite -- aqui é contando quantos ºC que passou
FROM medidaSensor m
INNER JOIN salaSensor ss ON m.fk_sensor = ss.id
INNER JOIN sala sa ON ss.fk_sala = sa.id
WHERE sa.fk_bioterio = 1
  AND m.momento >= NOW() - INTERVAL 24 HOUR; -- Essa linha filtra as medidas pelo horário, e mantém só as das últimas 24 horas
  
-- =====================================================
-- DASHBOARD "TEMPO REAL" (sala)
-- =====================================================
 
-- KPIs Temperatura atual e Última atualização
SELECT m.temperatura AS temperatura_atual,
       m.momento,
       TIMESTAMPDIFF(MINUTE, m.momento, NOW()) AS minutos_atras
FROM medidaSensor m
JOIN salaSensor ss ON m.fk_sensor = ss.id
WHERE ss.fk_sala = 1
ORDER BY m.momento DESC
LIMIT 1;

-- KPI Status: no JavaScript
-- se temperatura_atual > 26 ou < 20 -> "Fora da faixa", senão -> "Normal"
-- isso só na proxima sprint, creio eu

-- Gráfico de linha: últimos 30 minutos
SELECT DATE_FORMAT(m.momento, '%H:%i') AS hora, m.temperatura
FROM medidaSensor m
JOIN salaSensor ss ON m.fk_sensor = ss.id
WHERE ss.fk_sala = 1
AND m.momento >= NOW() - INTERVAL 30 MINUTE -- Essa linha filtra as medidas pelo horário, e mantém só as dos últimos 30 minutos
ORDER BY m.momento;
  
  