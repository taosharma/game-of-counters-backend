const express = require("express");

const PORT = 5000;

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const cors = require("cors");
app.use(cors());

app.use(express.json());

let numberOfPlayers = 0;

let player1Counter = 0;
let player2Counter = 0;

function assignRoom() {
  numberOfPlayers++;
  if (numberOfPlayers % 2 === 0) {
    return 2;
  } else return 1;
}

function checkWinner(id) {
  if (player1Counter === player2Counter) {
    return "It's a draw...";
  }
  if (id === "1") {
    if (player1Counter > player2Counter) {
      return "You are winning!";
    } else return "You are losing!";
  }
  if (id === "2") {
    if (player2Counter > player1Counter) {
      return "You are winning!";
    } else return "You are losing!";
  }
}

const game = io.of("/game");

game.on("connection", (socket) => {
  socket.join(`${assignRoom()}`);
  let room = Object.keys(socket.adapter.sids[socket.id]);
  console.log(`Player has joined room ${room[0]}`);

  game.to(`${room[0]}`).emit("joinedRoom", {
    message: `You have joined room ${room[0]}.`,
    id: room[0],
    player1Counter,
    player2Counter,
  });

  game.emit("updateCounters", { player1Counter, player2Counter });

  game.to(`${socket.id}`).emit("currentWinner", {
    message: `${checkWinner(socket.id)}`,
  });

  socket.on("incrementCounter", (socket) => {
    console.log(socket);
    if (socket.id === "1") {
      player1Counter++;
    }
    if (socket.id === "2") {
      player2Counter++;
    }
    console.log(player1Counter, player2Counter);
    game.emit("updateCounters", { player1Counter, player2Counter });
    game.to(`${socket.id}`).emit("currentWinner", {
      message: `${checkWinner(socket.id)}`,
    });
  });
});

server.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
