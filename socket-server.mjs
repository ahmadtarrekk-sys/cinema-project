import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();
const PORT = 3001;
const SOCKET_SECRET = process.env.SOCKET_SECRET || "development-secret";

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(200);
  res.end("Socket.IO Server running (MongoDB)");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const HOLD_DURATION_SEC = 180; // 3 minutes
const MAX_SEATS_PER_USER = 4;

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error: No token provided"));
  
  try {
    const decoded = jwt.verify(token, SOCKET_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;

  socket.on("joinShowtime", async (showtimeId) => {
    socket.join(showtimeId);
    
    // Fetch currently held seats
    const activeHolds = await prisma.seatHold.findMany({
      where: {
        showtimeId,
        expiresAt: { gt: new Date() }
      }
    });
      
    socket.emit("initialHolds", activeHolds.map(h => ({ seatId: h.seatId, userId: h.userId })));
  });

  socket.on("holdSeat", async ({ showtimeId, seatId }, callback) => {
    try {
      // 1. Max seats check
      const currentHolds = await prisma.seatHold.count({
        where: { showtimeId, userId, expiresAt: { gt: new Date() } }
      });

      if (currentHolds >= MAX_SEATS_PER_USER) {
        if (typeof callback === 'function') callback({ error: "Max limits reached" });
        return socket.emit("holdRejected", { seatId, message: `You can only reserve up to ${MAX_SEATS_PER_USER} seats.` });
      }

      // 2. Prevent race condition by verifying existing active locks
      const existingLock = await prisma.seatHold.findUnique({
        where: { showtimeId_seatId: { showtimeId, seatId } }
      });

      if (existingLock && existingLock.userId !== userId && existingLock.expiresAt > new Date()) {
        if (typeof callback === 'function') callback({ error: "Seat already held" });
        return;
      }

      // 3. Atomically upsert the seat hold
      const expiresAt = new Date(Date.now() + HOLD_DURATION_SEC * 1000);
      await prisma.seatHold.upsert({
        where: { showtimeId_seatId: { showtimeId, seatId } },
        create: { showtimeId, seatId, userId, expiresAt },
        update: { userId, expiresAt }
      });

      io.to(showtimeId).emit("seatHeld", { seatId, userId });
      if (typeof callback === 'function') callback({ success: true });
    } catch (err) {
      console.error("Lock error:", err);
      if (typeof callback === 'function') callback({ error: "Server Error" });
    }
  });

  socket.on("releaseSeat", async ({ showtimeId, seatId }) => {
    try {
      await prisma.seatHold.deleteMany({
        where: { showtimeId, seatId, userId }
      });
      io.to(showtimeId).emit("seatReleased", { seatId, userId });
    } catch(err) {
      // Ignore if not present
    }
  });

  socket.on("seatsBooked", async ({ showtimeId, seatIds }) => {
    try {
      await prisma.seatHold.deleteMany({
        where: { showtimeId, seatId: { in: seatIds } }
      });
      io.to(showtimeId).emit("seatsBooked", { seatIds });
    } catch(err) {}
  });

  socket.on("disconnect", () => {});
});

// Periodic Cleanup of Expired Holds
setInterval(async () => {
  try {
    const expiredHolds = await prisma.seatHold.findMany({
      where: { expiresAt: { lte: new Date() } }
    });

    if (expiredHolds.length > 0) {
      // Broadcast release
      expiredHolds.forEach(hold => {
        io.to(hold.showtimeId).emit("seatReleased", { seatId: hold.seatId, userId: hold.userId });
      });

      // Delete from DB
      await prisma.seatHold.deleteMany({
        where: { id: { in: expiredHolds.map(h => h.id) } }
      });
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
}, 5000); // Check every 5s

server.listen(PORT, () => {
  console.log(`Socket.IO Server running on http://localhost:${PORT}`);
});
