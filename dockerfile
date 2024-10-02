# Usar uma imagem leve do Node.js com base no Alpine
FROM node:18-alpine

# Instalar dependências para a compilação de módulos nativos (incluindo bcrypt)
RUN apk add --no-cache python3 make g++

# Define o diretório de trabalho onde o app será armazenado no contêiner
WORKDIR /usr/app

# Copiar os arquivos de configuração de dependências (package.json e package-lock.json)
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Recompilar módulos nativos, como bcrypt, para a arquitetura do contêiner
RUN npm rebuild bcrypt --build-from-source

# Copiar o restante dos arquivos do projeto para dentro do contêiner
COPY . .

# Expõe a porta 5000 para o contêiner
EXPOSE 5000

# Comando padrão para iniciar a aplicação
CMD ["npm", "start"]
