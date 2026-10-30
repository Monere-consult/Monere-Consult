# Monere-Consult
<img width="100" height="100" alt="72f8c2fe-ab5b-4e03-933e-ea0ae0def00b" src="https://github.com/user-attachments/assets/a6f6ad64-b235-4016-98af-192c4093693e" />






## Sobre o projeto

O **Monere Consult** é um Sistema de Suporte à Decisão (SSD) desenvolvido com o objetivo de monitorar a temperatura das salas de biotérios utilizadas no alojamento de ratos durante estudos pré-clínicos de vacinas. A solução busca facilitar a identificação de alterações nas condições ambientais, contribuindo para o acompanhamento dos experimentos e auxiliando os pesquisadores na tomada de decisão.

## Funcionamento do sistema

O projeto utiliza sensores físicos LM35 para realizar a coleta da temperatura nas salas do biotério. Os sinais coletados são recebidos por um Arduino Uno e enviados a uma API desenvolvida em Node.js, responsável por receber os dados e encaminhá-los para armazenamento.

O sistema conta com um **banco de dados MySQL**, integrado à aplicação por meio de APIs, para armazenar as leituras de temperatura e permitir consultas ao histórico. Outra API, também desenvolvida em Node.js, realiza a comunicação entre o banco de dados e a aplicação web, disponibilizando as informações necessárias para a exibição dos dados no site.

## Funcionalidades

- **Monitoramento de temperatura:** acompanhamento das temperaturas das salas do biotério.
- **Dashboard:** visualização das temperaturas registradas, identificação das salas, status das leituras e histórico dos dados.
- **Alertas de temperatura:** identificação de valores abaixo de 20 °C ou acima de 26 °C, considerando a faixa de referência inicial adotada pelo projeto.
- **Cadastro e login:** acesso às funcionalidades do sistema por meio de uma área de autenticação.
- **Simulador financeiro:** estimativa de possíveis perdas financeiras e de recuperação econômica potencial com base nos parâmetros definidos pela equipe.
- Site institucional: site próprio do projeto, com apresentação da Monere Consult, sobre nós, soluções, simulador e nossa equipe.

## Tecnologias utilizadas

- **Arduino Uno:** recebe os sinais dos sensores.
- **Sensor LM35:** realiza a medição da temperatura.
- **Node.js:** desenvolvimento das APIs responsáveis pela comunicação e pelo processamento dos dados.
- **MySQL:** armazenamento das leituras e do histórico de temperaturas.
- **HTML, CSS e JavaScript:** desenvolvimento da interface web, do dashboard e do simulador financeiro.
- **Lubuntu Linux:** ambiente virtual previsto para hospedar os serviços de aplicação e banco de dados.

## Objetivo

O Monere Consult busca facilitar a identificação de alterações de temperatura, organizar o histórico das medições e fornecer alertas que auxiliem os pesquisadores a avaliar possíveis irregularidades durante os estudos pré-clínicos de vacinas.

O sistema atua como ferramenta de apoio à decisão: **não realiza o controle automático da temperatura**, não aciona equipamentos de aquecimento ou resfriamento e não substitui a avaliação dos pesquisadores e dos responsáveis pelo biotério.

## Autores e Responsáveis

- [Christian Misael](https://github.com/CHRISTIANMISAEL)
- [João Vitor ](https://github.com/crocejoao)
- [Levi Greb](https://github.com/Legreb)
- [João Pedro Sakamoto](https://github.com/joaohashimoto)
- [Fernando de Oliveira](https://github.com/FernandoOliveiraa7)
- [Bianca Ramos](https://github.com/BiancaRamos4)
- [Gustavo Cerqueira](https://github.com/Gustavo-C-Fernandes)


