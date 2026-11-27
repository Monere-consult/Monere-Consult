-- =====================================================================
-- MONERE CONSULT - SCRIPT COMPLETO DO BANCO DE DADOS
--
-- 1. Tabelas
-- 2. Inserts (dados iniciais + salas de teste da filial Paulista)
-- 3. Medidas de teste para a dashboard (8 dias, uma a cada 10 minutos)
-- 4. Selects usados pela dashboard nova (rotas /salas e /medidas)
-- 5. Selects da dashboard antiga (sprint anterior)
--
-- ATENÇÃO: a linha DROP DATABASE apaga o banco inteiro e cria de novo do zero.
-- Use só no banco de desenvolvimento/teste.
-- =====================================================================

DROP DATABASE IF EXISTS monere_consult;
CREATE DATABASE monere_consult;
USE monere_consult;

-- =====================================================================
-- 1. TABELAS
-- =====================================================================

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

-- =====================================================================
-- 2. INSERTS
-- =====================================================================

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
('Morumbi',  '78654321', 'Rua Agrimensor Sugaya', 930, 'Leste', 1),
('Norte',    '23458690', 'Avenida Elisio Teixeira Leite', 5097, 'Norte', 2),
('Leste II', '15273890', 'Rua Carlos Bigatti', 44, 'Leste', 2);

-- sala
INSERT INTO sala VALUES
(DEFAULT, 'Sala 1', 1, 'ativo', 1),
(DEFAULT, 'Sala 2', 2, 'ativo', 2),
(DEFAULT, 'Sala 3', 3, 'manutenção', 3),
(DEFAULT, 'Sala 4', 4, 'inativo', 4),
-- salas de teste da filial Paulista (bioterio 1), usadas pela dashboard
(DEFAULT, 'Sala 2', 1, 'ativo', 1),
(DEFAULT, 'Sala 3', 1, 'ativo', 1),
(DEFAULT, 'Sala 4', 2, 'ativo', 1),
(DEFAULT, 'Sala 5', 2, 'ativo', 1);

-- salaSensor
INSERT INTO salaSensor VALUES
(DEFAULT, 'ativo', 1),
(DEFAULT, 'ativo', 2),
(DEFAULT, 'manutenção', 3),
(DEFAULT, 'inativo', 4),
-- sensores das salas de teste da filial Paulista (salas 5, 6, 7 e 8)
(DEFAULT, 'ativo', 5),
(DEFAULT, 'ativo', 6),
(DEFAULT, 'ativo', 7),
(DEFAULT, 'ativo', 8);


-- =====================================================================
-- 3. MEDIDAS DE TESTE PARA A DASHBOARD (filial Paulista)
--
-- Gera 8 dias de medidas, uma a cada 10 minutos, terminando AGORA.
-- Situações criadas para testar todas as cores da dashboard:
--   Sala 1 -> na faixa agora (verde), mas ficou abaixo de 20 °C ontem das 03h às 05h
--   Sala 2 -> FORA da faixa agora: acima de 26 °C, última medida na faixa há 50 minutos (vermelho)
--   Sala 3 -> PERTO do limite: entre 25,6 e 25,9 °C nas últimas 2 horas (amarelo)
--   Sala 4 -> SEM COMUNICAÇÃO: parou de enviar medidas há 50 minutos (cinza)
--   Sala 5 -> na faixa (verde), com uma queda abaixo de 20 °C há 5 dias às 06h
--
-- ATENÇÃO: a dashboard considera "sem comunicação" o sensor que não manda medida há mais
-- de 5 minutos. Como este script não fica inserindo medidas sozinho (quem faz isso é o
-- Arduino), depois de 5 minutos TODAS as salas vão aparecer cinzas.
-- Para apresentar, rode de novo só esta parte 3 (do SET @sensor1 até o DROP TEMPORARY TABLE).
-- =====================================================================

-- Guarda o id do sensor de cada sala da filial Paulista
SET @sensor1 = (SELECT ss.id FROM salaSensor ss INNER JOIN sala sa ON ss.fk_sala = sa.id WHERE sa.fk_bioterio = 1 AND sa.nome = 'Sala 1' LIMIT 1);
SET @sensor2 = (SELECT ss.id FROM salaSensor ss INNER JOIN sala sa ON ss.fk_sala = sa.id WHERE sa.fk_bioterio = 1 AND sa.nome = 'Sala 2' LIMIT 1);
SET @sensor3 = (SELECT ss.id FROM salaSensor ss INNER JOIN sala sa ON ss.fk_sala = sa.id WHERE sa.fk_bioterio = 1 AND sa.nome = 'Sala 3' LIMIT 1);
SET @sensor4 = (SELECT ss.id FROM salaSensor ss INNER JOIN sala sa ON ss.fk_sala = sa.id WHERE sa.fk_bioterio = 1 AND sa.nome = 'Sala 4' LIMIT 1);
SET @sensor5 = (SELECT ss.id FROM salaSensor ss INNER JOIN sala sa ON ss.fk_sala = sa.id WHERE sa.fk_bioterio = 1 AND sa.nome = 'Sala 5' LIMIT 1);

-- Apaga as medidas antigas desses sensores
-- (o SQL_SAFE_UPDATES = 0 evita o bloqueio de DELETE do MySQL Workbench)
SET SQL_SAFE_UPDATES = 0;
DELETE FROM medidaSensor WHERE fk_sensor IN (@sensor1, @sensor2, @sensor3, @sensor4, @sensor5);

-- Tabela temporária com os números de 0 a 1999.
-- Cada número "n" vira um horário: AGORA menos n x 10 minutos.
-- n = 0 -> agora | n = 6 -> 1 hora atrás | n = 1152 -> 8 dias atrás
-- O ORDER BY p.n DESC nos inserts grava do mais antigo para o mais novo (assim o id cresce junto com o horário)
DROP TEMPORARY TABLE IF EXISTS passos;
CREATE TEMPORARY TABLE passos (n INT);

INSERT INTO passos (n)
SELECT unidade.d + 10 * dezena.d + 100 * centena.d + 1000 * milhar.d
FROM (SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS unidade
CROSS JOIN (SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS dezena
CROSS JOIN (SELECT 0 AS d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
      UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS centena
CROSS JOIN (SELECT 0 AS d UNION ALL SELECT 1) AS milhar;


-- Sala 1: na faixa agora, mas ontem das 03h às 05h ficou abaixo de 20 °C
INSERT INTO medidaSensor (temperatura, momento, fk_sensor)
SELECT
    ROUND(
        CASE
            WHEN DATE(NOW() - INTERVAL p.n * 10 MINUTE) = CURDATE() - INTERVAL 1 DAY
             AND HOUR(NOW() - INTERVAL p.n * 10 MINUTE) IN (3, 4)
            THEN 19.2 + RAND() * 0.5
            ELSE 22.5 + SIN(2 * PI() * (HOUR(NOW() - INTERVAL p.n * 10 MINUTE) - 9) / 24) + (RAND() - 0.5) * 0.4
        END, 2),
    NOW() - INTERVAL p.n * 10 MINUTE,
    @sensor1
FROM passos p
WHERE p.n <= 1152
ORDER BY p.n DESC;


-- Sala 2: FORA da faixa nos últimos 40 minutos (e também há 3 dias, das 14h às 16h)
INSERT INTO medidaSensor (temperatura, momento, fk_sensor)
SELECT
    ROUND(
        CASE
            WHEN p.n <= 4
            THEN 27.0 + RAND() * 1.4
            WHEN DATE(NOW() - INTERVAL p.n * 10 MINUTE) = CURDATE() - INTERVAL 3 DAY
             AND HOUR(NOW() - INTERVAL p.n * 10 MINUTE) IN (14, 15)
            THEN 26.5 + RAND() * 1.0
            ELSE 23.5 + SIN(2 * PI() * (HOUR(NOW() - INTERVAL p.n * 10 MINUTE) - 9) / 24) + (RAND() - 0.5) * 0.4
        END, 2),
    NOW() - INTERVAL p.n * 10 MINUTE,
    @sensor2
FROM passos p
WHERE p.n <= 1152
ORDER BY p.n DESC;


-- Sala 3: PERTO do limite nas últimas 2 horas (25,6 a 25,9 °C: ainda dentro da faixa)
INSERT INTO medidaSensor (temperatura, momento, fk_sensor)
SELECT
    ROUND(
        CASE
            WHEN p.n <= 12
            THEN 25.6 + RAND() * 0.3
            ELSE 24.0 + SIN(2 * PI() * (HOUR(NOW() - INTERVAL p.n * 10 MINUTE) - 9) / 24) + (RAND() - 0.5) * 0.4
        END, 2),
    NOW() - INTERVAL p.n * 10 MINUTE,
    @sensor3
FROM passos p
WHERE p.n <= 1152
ORDER BY p.n DESC;


-- Sala 4: SEM COMUNICAÇÃO — a última medida foi há 50 minutos (n começa em 5)
INSERT INTO medidaSensor (temperatura, momento, fk_sensor)
SELECT
    ROUND(23.0 + SIN(2 * PI() * (HOUR(NOW() - INTERVAL p.n * 10 MINUTE) - 9) / 24) + (RAND() - 0.5) * 0.4, 2),
    NOW() - INTERVAL p.n * 10 MINUTE,
    @sensor4
FROM passos p
WHERE p.n BETWEEN 5 AND 1152
ORDER BY p.n DESC;


-- Sala 5: na faixa, com uma queda abaixo de 20 °C há 5 dias, às 06h
INSERT INTO medidaSensor (temperatura, momento, fk_sensor)
SELECT
    ROUND(
        CASE
            WHEN DATE(NOW() - INTERVAL p.n * 10 MINUTE) = CURDATE() - INTERVAL 5 DAY
             AND HOUR(NOW() - INTERVAL p.n * 10 MINUTE) = 6
            THEN 19.0 + RAND() * 0.6
            ELSE 22.0 + 0.8 * SIN(2 * PI() * (HOUR(NOW() - INTERVAL p.n * 10 MINUTE) - 9) / 24) + (RAND() - 0.5) * 0.4
        END, 2),
    NOW() - INTERVAL p.n * 10 MINUTE,
    @sensor5
FROM passos p
WHERE p.n <= 1152
ORDER BY p.n DESC;

DROP TEMPORARY TABLE IF EXISTS passos;

-- Conferência: quantas medidas cada sala recebeu e qual foi a última
SELECT sa.nome, COUNT(m.id) AS medidas, MAX(m.momento) AS ultima_medida
FROM sala sa
INNER JOIN salaSensor ss ON ss.fk_sala = sa.id
LEFT JOIN medidaSensor m ON m.fk_sensor = ss.id
WHERE sa.fk_bioterio = 1
GROUP BY sa.id, sa.nome
ORDER BY sa.id;


-- =====================================================================
-- 4. SELECTS DA DASHBOARD NOVA (versão simples, para consultar no Workbench)
-- Exemplos com: usuário 1, biotério 1 (filial Paulista) e sala 1.
-- =====================================================================

-- Empresa e filial do usuário logado
SELECT empresa.razao_social, bioterio.nome AS filial
FROM usuario
JOIN empresa ON usuario.fk_empresa = empresa.id
JOIN bioterio ON bioterio.fk_empresa = empresa.id
WHERE usuario.id = 1;

-- Salas da filial
SELECT id, nome
FROM sala
WHERE fk_bioterio = 1;

-- Última temperatura de uma sala
SELECT medidaSensor.temperatura, medidaSensor.momento
FROM medidaSensor
JOIN salaSensor ON medidaSensor.fk_sensor = salaSensor.id
WHERE salaSensor.fk_sala = 1
ORDER BY medidaSensor.momento DESC
LIMIT 1;

-- KPI Salas fora da faixa: medidas acima de 26 °C ou abaixo de 20 °C nos últimos 5 minutos
SELECT sala.nome, medidaSensor.temperatura, medidaSensor.momento
FROM medidaSensor
JOIN salaSensor ON medidaSensor.fk_sensor = salaSensor.id
JOIN sala ON salaSensor.fk_sala = sala.id
WHERE sala.fk_bioterio = 1
AND medidaSensor.momento >= NOW() - INTERVAL 5 MINUTE
AND (medidaSensor.temperatura > 26 OR medidaSensor.temperatura < 20);

-- KPI Salas perto do limite: medidas entre 25,5 e 26 °C ou entre 20 e 20,5 °C nos últimos 5 minutos
SELECT sala.nome, medidaSensor.temperatura, medidaSensor.momento
FROM medidaSensor
JOIN salaSensor ON medidaSensor.fk_sensor = salaSensor.id
JOIN sala ON salaSensor.fk_sala = sala.id
WHERE sala.fk_bioterio = 1
AND medidaSensor.momento >= NOW() - INTERVAL 5 MINUTE
AND (medidaSensor.temperatura BETWEEN 25.5 AND 26 OR medidaSensor.temperatura BETWEEN 20 AND 20.5);

-- KPI Sensores sem comunicação: sensores que NÃO mandaram medida nos últimos 5 minutos
SELECT sala.nome
FROM sala
JOIN salaSensor ON salaSensor.fk_sala = sala.id
WHERE sala.fk_bioterio = 1
AND salaSensor.id NOT IN (SELECT fk_sensor FROM medidaSensor WHERE momento >= NOW() - INTERVAL 5 MINUTE);

-- KPI Alerta ativo há: última vez que a sala esteve dentro da faixa (20 °C a 26 °C)
SELECT medidaSensor.momento
FROM medidaSensor
JOIN salaSensor ON medidaSensor.fk_sensor = salaSensor.id
WHERE salaSensor.fk_sala = 1
AND medidaSensor.temperatura BETWEEN 20 AND 26
ORDER BY medidaSensor.momento DESC
LIMIT 1;

-- Gráfico de linha: temperaturas das últimas 24 horas
SELECT medidaSensor.momento, medidaSensor.temperatura
FROM medidaSensor
JOIN salaSensor ON medidaSensor.fk_sensor = salaSensor.id
WHERE salaSensor.fk_sala = 1
AND medidaSensor.momento >= NOW() - INTERVAL 24 HOUR
ORDER BY medidaSensor.momento;

-- Gráfico de linha: temperaturas de um dia anterior (ontem; para 2 dias atrás troque o 1 por 2, até 7)
SELECT medidaSensor.momento, medidaSensor.temperatura
FROM medidaSensor
JOIN salaSensor ON medidaSensor.fk_sensor = salaSensor.id
WHERE salaSensor.fk_sala = 1
AND DATE(medidaSensor.momento) = CURDATE() - INTERVAL 1 DAY
ORDER BY medidaSensor.momento;


-- =====================================================================
-- 5. SELECTS DA DASHBOARD ANTIGA (sprint anterior)
-- A dashboard nova NÃO usa estes selects.
-- =====================================================================

-- Gráfico de barras: temperatura mais recente de cada sala
-- (a medida mais recente é a de maior id de cada sensor)
SELECT sala.nome, medidaSensor.temperatura
FROM sala
JOIN salaSensor ON salaSensor.fk_sala = sala.id
JOIN medidaSensor ON medidaSensor.id = (SELECT MAX(id) FROM medidaSensor WHERE fk_sensor = salaSensor.id)
WHERE sala.fk_bioterio = 1;

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
