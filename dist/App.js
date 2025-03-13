"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
class App {
  constructor() {
    this.app = (0, express_1.default)();
    this.http = http_1.default.createServer(this.app);
    this.io = new socket_io_1.Server(this.http, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
      },
    });
    const corsOptions = {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
    };
    this.app.use((0, cors_1.default)(corsOptions));
  }
  listenServer() {
    this.http.listen(3000, () => console.log("Server is running!"));
  }
  listenIo() {
    this.io.on("connection", (socket) => {
      console.log("Cliente conectado:", socket.id);
    });
  }
}
const app = new App();
app.listenServer();
app.listenIo();
console.log("Servidor e WebSocket configurados com sucesso!");
//# sourceMappingURL=App.js.map
