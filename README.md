# API Node com Express e MySQL

Este projeto é uma API desenvolvida em Node.js utilizando o framework Express e o banco de dados MySQL. A aplicação está configurada para ser executada em um ambiente Docker, permitindo fácil implementação e escalabilidade.

## Descrição do Projeto

A API foi criada para demonstrar a integração de uma aplicação Node.js com Express e MySQL, usando Docker para a criação de containers. Este projeto serve como um exemplo básico para quem deseja aprender a configurar uma API RESTful com essas tecnologias.

## Pré-requisitos

- [Docker](https://www.docker.com/) instalado na máquina

## Instruções para Configuração

### 1. Criando a imagem Docker

Para criar a imagem Docker da aplicação, execute o comando abaixo no terminal, na raiz do projeto:

```bash
docker build -t apiScheduleWell/dockernode .
```
### 2. Criando o container
Depois que a imagem Docker for criada, execute o seguinte comando para iniciar o container:

```bash
docker run -p 5000:5000 -d apiScheduleWell/dockernode
```
### OBS - Utilizando Docker Compose
Como estamos utilizando o Compose, basta utilizar somente este comando para orquestrar os containers:
```bash
docker-compose up --build
```