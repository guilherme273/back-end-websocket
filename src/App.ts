import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

interface ROOM {
  title: string;
  msg: { content: string; remetente: string; avatar: string; id: string }[];
  usersOnline: { id: string; nickname: string }[];
}

class App {
  private app: Application;
  private http: http.Server;
  private io: Server;

  private rooms: ROOM[] = [
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
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
      },
    });

    this.app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
      })
    );
  }

  listenServer() {
    this.http.listen(3000, () => console.log("Server is running!"));
  }

  listenIo() {
    this.io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);

      socket.on("joinRoom", (roomName, NickName) => {
        console.log(`${socket.id} entrou na sala ${roomName}`);
        socket.join(roomName);
        const room = this.rooms.find((r) => r.title === roomName);
        if (room) {
          const user = room.usersOnline.find((user) => user.id === socket.id);
          if (!user) {
            room.msg.push({
              content: `${NickName} Entrou na sala`,
              remetente: "SYSTEM",
              avatar: "",
              id: Date.now().toString(),
            });
          }
        }
        const msgsRoom = room?.msg;
        this.io.to(roomName).emit("joinRoom", msgsRoom);
        const user = room?.usersOnline.find((user) => user.id === socket.id);
        if (!user) {
          room?.usersOnline.push({ id: socket.id, nickname: NickName });
        }

        console.log(this.rooms);
      });

      socket.on("message", (roomName, msg, NikName, avatar, id) => {
        const room = this.rooms.find((r) => r.title === roomName);
        if (room) {
          room.msg.push({ content: msg, remetente: NikName, avatar, id });
          this.io.to(roomName).emit("message", msg, NikName, avatar, id);
          console.log(this.rooms);
        }
      });

      socket.on("leaveRoom", (roomName, NickName) => {
        const room = this.rooms.find((r) => r.title === roomName);

        if (room) {
          const user = room.usersOnline.find((user) => user.id === socket.id);

          if (user) {
            // Adicionar a mensagem de saída
            const leaveMsg = {
              content: `${NickName} Saiu da sala`,
              remetente: "SYSTEM",
              avatar: "",
              id: Date.now().toString(),
            };
            room.msg.push(leaveMsg);

            // Emitir a mensagem de saída para os outros usuários na sala imediatamente
            this.io.to(roomName).emit("leaveRoom", room.msg);
          }

          // Remover o usuário da lista de online
          room.usersOnline = room.usersOnline.filter(
            (user) => user.id !== socket.id
          );
        }

        // Fazer o usuário sair da sala
        socket.leave(roomName);
        console.log(`${socket.id} saiu da sala ${roomName}`);
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
