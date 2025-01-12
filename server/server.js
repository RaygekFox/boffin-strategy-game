const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Зберігаємо стан мапи
let elements = [];

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
  console.log('A user connected');

  // Відправляємо поточну мапу новому гравцеві
  socket.emit('updateMap', elements);

  // Додавання елемента
  socket.on('addElement', (data) => {
    elements.push(data);
    io.emit('updateMap', elements);
  });

  // Очищення мапи
  socket.on('clearMap', () => {
    elements = [];
    io.emit('updateMap', elements);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
