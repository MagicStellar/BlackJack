import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { BlackjackRouletteRoom } from "./rooms/BlackjackRouletteRoom";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    game: "blackjack-roulette"
  });
});

const httpServer = http.createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer
  })
});

// Register room
gameServer.define("blackjack_room", BlackjackRouletteRoom);

httpServer.listen(port, () => {
  console.log(`[Blackjack Roulette Server] authoritative server listening on ws://localhost:${port}`);
});

export default app;
