import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

class App {
  private app: Application;
  private http: http.Server;
  private io: Server;
  private rooms: [] = [
    "Falando de Java",
    "Discução Sobre Ia",
    "Procuro Por Um Freela",
    "NodeJS",
    "Cloud",
  ];

  constructor() {
    this.app = express();
    this.http = http.createServer(this.app);

    this.io = new Server(this.http, {
      cors: {
        origin: "*", // Permite qualquer origem
        methods: ["GET", "POST"], // Permite GET e POST
        allowedHeaders: ["Content-Type"], // Permite o Content-Type
      },
    });

    const corsOptions = {
      origin: "*", // Permite qualquer origem
      methods: ["GET", "POST"], // Permite GET e POST
      allowedHeaders: ["Content-Type"], // Permite o Content-Type
    };

    this.app.use(cors(corsOptions));
  }

  listenServer() {
    this.http.listen(3000, () => console.log("Server is running!"));
  }

  listenIo() {
    this.io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);

      socket.on("joinRoom", (roomName) => {
        socket.join(roomName);
        console.log(`${socket.id} entrou na sala: ${roomName}`);
      });

      socket.on("message", (msg) => {
        console.log("message:", msg.msg);
        this.io.emit("message", msg);
      });

      socket.on("disconnect", () => {
        console.log("Usuário desconectado:", socket.id);
      });
    });
  }
}

const app = new App();
app.listenServer();
app.listenIo();
