import { Server } from "socket.io";
import http from "http";

const PORT = 3001;

// Simple Node HTTP server to attach Socket.IO
const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(200);
  res.end("Socket.IO Server running");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory store for held seats
// Structure: { showtimeId: { seatId: { userId, timestamp } } }
const heldSeats = new Map();

const HOLD_DURATION_MS = 5 * 60 * 1000; // 5 minutes

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinShowtime", (showtimeId) => {
    socket.join(showtimeId);
    
    // Dispatch currently held seats for this showtime to the joining client
    const showtimeHolds = heldSeats.get(showtimeId) || new Map();
    const activeHolds = Array.from(showtimeHolds.entries())
      .filter(([_, hold]) => Date.now() - hold.timestamp < HOLD_DURATION_MS)
      .map(([seatId, hold]) => ({ seatId, userId: hold.userId }));
      
    socket.emit("initialHolds", activeHolds);
  });

  socket.on("holdSeat", ({ showtimeId, seatId, userId }) => {
    let showtimeHolds = heldSeats.get(showtimeId);
    if (!showtimeHolds) {
      showtimeHolds = new Map();
      heldSeats.set(showtimeId, showtimeHolds);
    }
    
    showtimeHolds.set(seatId, { userId, timestamp: Date.now() });
    
    // Broadcast to everyone in the showtime room
    io.to(showtimeId).emit("seatHeld", { seatId, userId });
  });

  socket.on("releaseSeat", ({ showtimeId, seatId, userId }) => {
    const showtimeHolds = heldSeats.get(showtimeId);
    if (showtimeHolds && showtimeHolds.has(seatId)) {
      const hold = showtimeHolds.get(seatId);
      if (hold.userId === userId) {
        showtimeHolds.delete(seatId);
        io.to(showtimeId).emit("seatReleased", { seatId, userId });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Ideally, we'd track which seats this socket held and release them,
    // but for simplicity, they will expire automatically after 5 minutes.
  });
});

// Clean up expired holds periodically (every minute)
setInterval(() => {
  const now = Date.now();
  for (const [showtimeId, showtimeHolds] of heldSeats.entries()) {
    for (const [seatId, hold] of showtimeHolds.entries()) {
      if (now - hold.timestamp >= HOLD_DURATION_MS) {
        showtimeHolds.delete(seatId);
        io.to(showtimeId).emit("seatReleased", { seatId, userId: hold.userId });
      }
    }
  }
}, 60000);

server.listen(PORT, () => {
  console.log(`Socket.IO Server running on http://localhost:${PORT}`);
});
