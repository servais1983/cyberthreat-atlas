// Healthcheck simple pour le backend
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('Backend is healthy');
    process.exit(0);
  } else {
    console.log(`Backend returned status code: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log(`Healthcheck failed: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('Healthcheck timeout');
  req.destroy();
  process.exit(1);
});

req.end();
