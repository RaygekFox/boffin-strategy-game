const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const socket = io();

let selectedElement = null;
const images = {
  house: new Image(),
  tree: new Image(),
  human: new Image(),
};

images.house.src = 'house.png';
images.tree.src = 'tree.png';
images.human.src = 'human.png';

document.getElementById('select-house').addEventListener('click', () => {
  selectedElement = 'house';
});
document.getElementById('select-tree').addEventListener('click', () => {
  selectedElement = 'tree';
});
document.getElementById('clear-map').addEventListener('click', () => {
  socket.emit('clearMap');
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (selectedElement) {
    socket.emit('addElement', { type: selectedElement, x, y });
  } else {
    socket.emit('removeElement', { x, y });
  }
});

socket.on('updateMap', (elements) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  elements.forEach(({ type, x, y }) => {
    if (images[type].complete && images[type].naturalHeight !== 0) {
      ctx.drawImage(images[type], x, y, 50, 50);
    }
  });
});
