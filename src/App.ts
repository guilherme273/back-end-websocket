import express, { Application, Request, Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

interface ROOM {
  title: string;
  msg: { content: string; remetente: string; avatar: string; id: string }[];
  usersOnline: { id: string; nickname: string }[];
  urlIMG: string;
}
interface ALL_USERS_OLINE {
  id: string;
  nickname: string;
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
      urlIMG: "/img/java.jpg",
    },
    {
      title: "Discussão Sobre Ia",
      msg: [],
      usersOnline: [],
      urlIMG: "/img/ia.jpg",
    },
    {
      title: "Procuro Por Um Freela",
      msg: [],
      usersOnline: [],
      urlIMG: "/img/freelancer.png",
    },
    {
      title: "NodeJS",
      msg: [],
      usersOnline: [],
      urlIMG: "/img/node.png",
    },
    {
      title: "Type Script",
      msg: [],
      usersOnline: [],
      urlIMG: "/img/ts-js.png",
    },
    {
      title: "Bugs e soluções",
      msg: [],
      usersOnline: [],
      urlIMG: "/img/bug.jpg",
    },
  ];

  private allUsersOnline: ALL_USERS_OLINE[] = [];

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

    this.app.get("/rooms", (req: Request, res: Response) => {
      res.json(this.rooms);
    });
  }

  listenServer() {
    this.http.listen(3000, () => console.log("Server is running!"));
  }

  listenIo() {
    this.io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);

      socket.on("updateTotalUsersOn", (NickName) => {
        this.allUsersOnline.push({
          id: socket.id,
          nickname: NickName,
        });
        console.log(this.allUsersOnline);
        this.io.emit("updateTotalUsersOn", this.allUsersOnline);
      });

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
        const user = room?.usersOnline.find((user) => user.id === socket.id);
        if (!user) {
          room?.usersOnline.push({ id: socket.id, nickname: NickName });
        }

        this.io.to(roomName).emit("joinRoom", msgsRoom);
        this.io.to(roomName).emit("leaveRoomUpadeArray", this.rooms);
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
          this.io.to(roomName).emit("leaveRoomUpadeArray", this.rooms);
        }

        // Fazer o usuário sair da sala
        socket.leave(roomName);
        console.log(`${socket.id} saiu da sala ${roomName}`);
      });

      socket.on("disconnect", () => {
        console.log("Usuário desconectado:", socket.id);

        const NewArray = this.allUsersOnline.filter(
          (user) => user.id !== socket.id
        );

        this.allUsersOnline = NewArray;
        console.log(this.allUsersOnline);
        this.io.emit("Userdisconnecting", this.allUsersOnline, this.rooms);
      });
    });
  }
}

const app = new App();
app.listenServer();
app.listenIo();
