const app = require('./src/app');
const connectDB = require('./src/config/db');
const http = require('http');
const initializeSocket = require('./src/socket');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = http.createServer(app);
  initializeSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
