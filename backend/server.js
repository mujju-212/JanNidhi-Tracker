const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { initializeBlockchain } = require('./config/blockchain');
const { initializeSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

const io = new Server(httpServer, {
  cors: {
    origin: [corsOrigin, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

app.use(
  cors({
    origin: [corsOrigin, 'http://localhost:3000'],
    credentials: true
  })
);
app.use(express.json());
app.set('io', io);

// ─── Routes ───
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/superadmin', require('./routes/superadmin.routes'));
app.use('/api/ministry', require('./routes/ministry.routes'));
app.use('/api/state', require('./routes/state.routes'));
app.use('/api/district', require('./routes/district.routes'));
app.use('/api/auditor', require('./routes/auditor.routes'));
app.use('/api/public', require('./routes/public.routes'));
app.use('/api/citizen', require('./routes/citizen.routes'));
app.use('/api/blockchain', require('./routes/blockchain.routes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'JanNidhi API Running', time: new Date() });
});

app.use(errorHandler);

const start = async () => {
  try {
    await connectDB();
    await initializeBlockchain();
    initializeSocket(io);

    const port = process.env.PORT || 5000;
    httpServer.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });

    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`\n⚠️ Port ${port} is already in use.`);
        console.warn(`   → Backend appears to be already running on this port.`);
        console.warn(`   → Exiting this duplicate start request safely.\n`);
        process.exit(0);
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

start();
