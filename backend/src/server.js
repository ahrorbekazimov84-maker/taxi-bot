require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// io ni req ga biriktirish (controllerlarda ishlatish uchun)
app.use((req, res, next) => { req.io = io; next(); });

// ── Routes ───────────────────────────────────────────────────
app.use('/api', routes);

app.get('/', (req, res) => res.json({ message: '🚕 Taxi API ishlayapti', version: '1.0.0' }));

// ── Socket.IO ────────────────────────────────────────────────
const connectedDrivers = new Map();
const connectedPassengers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Yangi ulanish:', socket.id);

  // Haydovchi ulanadi
  socket.on('driver_connect', (driverId) => {
    socket.join(`driver_${driverId}`);
    connectedDrivers.set(driverId, socket.id);
    console.log(`🚗 Haydovchi ulandi: ${driverId}`);
  });

  // Yo'lovchi ulanadi
  socket.on('passenger_connect', (passengerId) => {
    socket.join(`passenger_${passengerId}`);
    connectedPassengers.set(passengerId, socket.id);
    console.log(`👤 Yo'lovchi ulandi: ${passengerId}`);
  });

  // Haydovchi lokatsiyasi (real-time)
  socket.on('update_location', ({ driverId, lat, lng }) => {
    socket.broadcast.emit(`location_${driverId}`, { lat, lng });
  });

  // Haydovchi trip rad etadi
  socket.on('reject_trip', ({ trip_id, driver_id }) => {
    console.log(`Trip rad etildi: ${trip_id} by ${driver_id}`);
  });

  socket.on('disconnect', () => {
    connectedDrivers.forEach((sid, dId) => { if (sid === socket.id) connectedDrivers.delete(dId); });
    connectedPassengers.forEach((sid, pId) => { if (sid === socket.id) connectedPassengers.delete(pId); });
    console.log('🔌 Ulanish uzildi:', socket.id);
  });
});

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`📡 Socket.IO tayyor`);
  console.log(`📋 API: http://localhost:${PORT}/api\n`);
});
