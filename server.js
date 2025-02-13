import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Permite conexões de qualquer lugar
});


const users = {};  // { username: socketId }
const rooms = ["Discussão sobre Java", "Sala da Inteligência Artificial", "Compartilhando Erros do Node"]; 

io.on("connection", (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    // Usuário faz login
    socket.on("registerUser", (username, callback) => {
        if (users[username]) {
            return callback({ success: false, message: "Nome de usuário já em uso!" });
        }
        users[username] = socket.id;
        callback({ success: true, message: "Usuário registrado com sucesso!" });
    });

    // Entrar em uma sala
    socket.on("joinRoom", (room) => {
        if (rooms.includes(room)) {
            socket.join(room);
            console.log(`${socket.id} entrou na sala ${room}`);
        }
    });

    // Enviar mensagem
    socket.on("chatMessage", ({ room, message, username }) => {
        io.to(room).emit("chatMessage", { username, message });
    });

    // Usuário desconectou
    socket.on("disconnect", () => {
        for (const username in users) {
            if (users[username] === socket.id) {
                delete users[username];
                break;
            }
        }
        console.log(`Usuário desconectado: ${socket.id}`);
    });
});

// Rota para teste
app.get("/", (req, res) => res.send("Servidor rodando..."));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
