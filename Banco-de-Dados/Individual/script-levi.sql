create database monere_consult;
use monere_consult;

-- MONERE CONSULT

create table empresa (
id int primary key auto_increment,
razao_social varchar(45) not null unique,
cnpj char(14) not null unique
);

create table usuario (
id int primary key auto_increment,
nome varchar(100) not null,
email varchar(100) not null unique,
senha varchar(45) not null,
tipo_usuario varchar(45) not null,
constraint chTipo_usuario check (tipo_usuario in ('admin', 'funcionario', 'gerente')),
fk_empresa int,
constraint fk_empresa
foreign key (fk_empresa)
references empresa(id)
);

create table bioterio (
id int primary key auto_increment,
cep char(8) not null,
logradouro varchar(70) not null,
numero int not null unique,
complemento varchar(45),
fk_empresa int not null,
constraint fk_empresaBioterio
foreign key (fk_empresa)
references empresa(id)
);

create table sala (
id int primary key auto_increment,
andar int not null, 
status_ varchar(20) not null,
constraint chStatus check (status_ in ('ativo', 'inativo', 'manutenção')),
fk_bioterio INt nOt nUll,
cOnstraint fk_bioterio
FOreign kEy (fk_bioterio)
rEferences bioterio(id)
);

create table salaSensor(
id int primary key auto_increment,
status varchar(20) not null,
constraint chEstadoSensor check (status_ IN ('ativo', 'inativo', 'manutenção')),
fk_sala int,
foreign key (fk_sala) 
References sala(id)
);

cREAte tabLe medidaSensor (
    id INT priMary key autO_increment,
    temperatura DECImal(10 , 2 ),
    momento DATEtime defAult curRent_timestamp,
    fk_sensor INT,
    conStraint fk_sensor FOREign key (fk_sensor)
        REfErences sensor (id)
);