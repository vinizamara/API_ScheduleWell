const fs = require('fs');
const https = require('https');
const http = require('http');
const app = require("./index");

// Caminhos para os certificados gerados pelo Let's Encrypt
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/schedulewell.westus.cloudapp.azure.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/schedulewell.westus.cloudapp.azure.com/fullchain.pem')
};

// Servidor HTTPS
https.createServer(options, app).listen(5000, () => {
  console.log('Servidor HTTPS rodando na porta 5000');
});

// (Opcional) Redirecionamento de HTTP para HTTPS
http.createServer((req, res) => {
  res.writeHead(301, { "Location": `https://${req.headers.host}${req.url}` });
  res.end();
}).listen(80, () => {
  console.log('Redirecionamento HTTP para HTTPS habilitado na porta 80');
});
