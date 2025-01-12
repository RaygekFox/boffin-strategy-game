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
  socket.emit('updateMap', elements);

  socket.on('addElement', (data) => {
    elements.push({ ...data, id: Date.now() });
    io.emit('updateMap', elements);
  });

  socket.on('removeElement', ({ x, y }) => {
    elements = elements.filter(
      (el) => !(Math.abs(el.x - x) < 50 && Math.abs(el.y - y) < 50)
    );
    io.emit('updateMap', elements);
  });

  socket.on('clearMap', () => {
    elements = [];
    io.emit('updateMap', elements);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Логіка світу
function gameLogic() {
  // Кожні 5 секунд: логіка дерев і домів
  setInterval(() => {
    const newElements = [];
    elements.forEach((el) => {
      if (el.type === 'house' && Math.random() < 0.2) {
        newElements.push({
          type: 'human',
          x: el.x + (Math.random() < 0.5 ? 50 : -50),
          y: el.y + (Math.random() < 0.5 ? 50 : -50),
          id: Date.now(),
        });
      }
      if (el.type === 'tree' && Math.random() < 0.2) {
        newElements.push({
          type: 'tree',
          x: el.x + (Math.random() < 0.5 ? 50 : -50),
          y: el.y + (Math.random() < 0.5 ? 50 : -50),
          id: Date.now(),
        });
      }
      if (el.type === 'human') {
        elements.forEach((tree) => {
          if (
            tree.type === 'tree' &&
            Math.hypot(tree.x - el.x, tree.y - el.y) < 50 &&
            Math.random() < 0.5
          ) {
            tree.type = 'house';
          }
        });
      }
    });
    elements = elements.concat(newElements);
    io.emit('updateMap', elements);
  }, 5000);

  // Кожну 1 секунду: рух людей
  setInterval(() => {
    elements.forEach((el) => {
      if (el.type === 'human') {
        el.x += Math.random() < 0.5 ? 10 : -10;
        el.y += Math.random() < 0.5 ? 10 : -10;
      }
    });
    io.emit('updateMap', elements);
  }, 1000);
}

gameLogic();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
