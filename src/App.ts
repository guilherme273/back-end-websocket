import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

class App {
  private app: Application;
  private http: http.Server;
  private io: Server;

  private rooms: [] = [
    {
      title: "Falando de Java",
      msg: [],
      usersOnline: [],
    },
    {
      title: "Discução Sobre Ia",
      msg: [],
      usersOnline: [],
    },
    {
      title: "Procuro Por Um Freela",
      msg: [],
      usersOnline: [],
    },
    {
      title: "NodeJS",
      msg: [],
      usersOnline: [],
    },
    {
      title: "Type Script",
      msg: [],
      usersOnline: [],
    },
    {
      title: "Compartilhando Bugs",
      msg: [],
      usersOnline: [],
    },
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

      socket.on("joinRoom", (roomName, NikName) => {
        socket.join(roomName);
        const room = this.rooms.find((r) => r.title === roomName);
        room.usersOnline.push({ id: socket.id });
      });

      socket.on("message", (roomName, NikName, msg) => {
        console.log(
          `${socket.id} mandou msg: ${msg} na sala ${roomName} nikname: ${NikName}`
        );
        this.io.emit("message", roomName, NikName, msg);
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
