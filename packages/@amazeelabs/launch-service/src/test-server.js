import { createServer } from 'http';

const port = parseInt(process.argv[2]) || 3000;

if (port === 666) {
  console.error('The port of the beast!');
  process.exit(1);
}

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.end('Hello, world!');
});

server.listen(port, 'localhost', () => {
  console.log(`Server is running on port ${port}`);
});

process.on('SIGTERM', () => {
  console.log('Stopping server');
  server.close();
});
