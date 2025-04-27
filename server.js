const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Store mapping from link IDs to socket IDs of laptop clients
const laptopClients = new Map();

app.get('/generate-link', (req, res) => {
  const linkId = uuidv4();
  res.json({ link: `${req.protocol}://${req.get('host')}/location.html?id=${linkId}` });
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  // Laptop client registers itself with a linkId
  socket.on('registerLaptop', (linkId) => {
    laptopClients.set(linkId, socket.id);
    console.log(`Laptop registered for linkId: ${linkId}`);
  });

  // Device sends location data with linkId
  socket.on('sendLocation', ({ linkId, location }) => {
    const laptopSocketId = laptopClients.get(linkId);
    if (laptopSocketId) {
      io.to(laptopSocketId).emit('locationUpdate', location);
      console.log(`Location sent to laptop for linkId: ${linkId}`, location);
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    // Remove any laptopClients entries with this socket id
    for (const [key, value] of laptopClients.entries()) {
      if (value === socket.id) {
        laptopClients.delete(key);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
