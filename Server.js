//-------------------------- Libraries --------------------------//
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');
require('dotenv').config();

//------------------------- Server Setup -------------------------//
const port = process.env.PORT || 3000;
const server = http.createServer(app);

//------------------------- Socket.io Setup -------------------------//
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Import socket logic
require('./sockets/chatbotSocket')(io);

//------------------------- Start -------------------------//
connectDB(); // Connect to MongoDB

server.listen(port,'0.0.0.0', () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
