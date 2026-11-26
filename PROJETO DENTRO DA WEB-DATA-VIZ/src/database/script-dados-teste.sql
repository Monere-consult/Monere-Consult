-- DADOS DE TESTE (opcional) - rode DEPOIS do script-tabelas.sql
-- Cria medidas dos últimos ~30 minutos para os sensores 1 e 2 (as consultas do dashboard olham os últimos 5/30 minutos e 24h)
-- Sensor 1 (Sala 1 / Paulista): fica na faixa 20-26 °C.
-- Sensor 2 (Sala 2 / Morumbi): sobe e passa do limite de 26 °C no fim.
-- Se esperar mais de 5 minutos, rode de novo para os KPIs "Sensores online" e "Fora da faixa" voltarem a aparecer.

USE monere_consult;

INSERT INTO medidaSensor (temperatura, momento, fk_sensor) VALUES
(22.10, NOW() - INTERVAL 30 MINUTE, 1), (22.60, NOW() - INTERVAL 28 MINUTE, 1),
(22.00, NOW() - INTERVAL 26 MINUTE, 1), (21.10, NOW() - INTERVAL 24 MINUTE, 1),
(21.60, NOW() - INTERVAL 22 MINUTE, 1), (22.60, NOW() - INTERVAL 20 MINUTE, 1),
(23.30, NOW() - INTERVAL 18 MINUTE, 1), (23.90, NOW() - INTERVAL 16 MINUTE, 1),
(23.40, NOW() - INTERVAL 14 MINUTE, 1), (23.30, NOW() - INTERVAL 12 MINUTE, 1),
(24.00, NOW() - INTERVAL 10 MINUTE, 1), (24.90, NOW() - INTERVAL 8 MINUTE, 1),
(25.50, NOW() - INTERVAL 6 MINUTE, 1),  (24.80, NOW() - INTERVAL 4 MINUTE, 1),
(24.00, NOW() - INTERVAL 2 MINUTE, 1),  (22.80, NOW(), 1);

INSERT INTO medidaSensor (temperatura, momento, fk_sensor) VALUES
(22.10, NOW() - INTERVAL 30 MINUTE, 2), (23.10, NOW() - INTERVAL 28 MINUTE, 2),
(23.40, NOW() - INTERVAL 26 MINUTE, 2), (23.00, NOW() - INTERVAL 24 MINUTE, 2),
(24.30, NOW() - INTERVAL 22 MINUTE, 2), (24.00, NOW() - INTERVAL 20 MINUTE, 2),
(24.60, NOW() - INTERVAL 18 MINUTE, 2), (24.80, NOW() - INTERVAL 16 MINUTE, 2),
(24.00, NOW() - INTERVAL 14 MINUTE, 2), (23.20, NOW() - INTERVAL 12 MINUTE, 2),
(24.80, NOW() - INTERVAL 10 MINUTE, 2), (24.30, NOW() - INTERVAL 8 MINUTE, 2),
(25.50, NOW() - INTERVAL 6 MINUTE, 2),  (26.80, NOW() - INTERVAL 4 MINUTE, 2),
(25.90, NOW() - INTERVAL 2 MINUTE, 2),  (28.40, NOW(), 2);
