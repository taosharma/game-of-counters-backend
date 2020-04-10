// Require express, define the port number.

const express = require("express");
const PORT = 5000;

/* After initialising express, create a variable 'server' which requires 'http' and creates a new server with express. 
Not sure exactly what this means bit means. After setting up the server, it is given to socket.io to use. I suppose this 
must be giving io the power to open web sockets on the server. */

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Cors is still a thing which must dealt with.

const cors = require("cors");
app.use(cors());

// So is json, if you wann send jsons to the client!

app.use(express.json());

/* A variable which tracks the number of players currently in the game. It should be equal to the number of clients connected
to the server. */

let numberOfPlayers = 0;

// Two variables which track the number of times each player's counter has been clicked.

let player1Counter = 0;
let player2Counter = 0;

/* A function which increments the number of players variable, and assigns room depending on the number of players
in the game by alternating between returning 1 or 2 accordingly. */

function assignRoom() {
  numberOfPlayers++;
  if (numberOfPlayers % 2 === 0) {
    return 2;
  } else return 1;
}

/* A function which takes in a player's id, and checks whether they are winning the game based on whether their counter is 
higher, lower or equal to their opponent. */

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

/* Uses io.of to assign a 'namespace' to a variable. io has a default namespace of '/', and all of the operations below would
work without this step. Namespaces are a way of seperating concerns within a server - perhaps each namespace should have its 
own folder, like a route?*/

const game = io.of("/game");

/* When a client socket connects to the 'game' namespace, the socket is captured in a call back function, and the following events
are opened. */

game.on("connection", (socket) => {
  /* The server puts the client in a room by taking their unique socket and assigning it a room. The room is generated
'dynamically' using the assign room function above. In reality, the room is either '1' or '2'. */

  socket.join(`${assignRoom()}`);

  /* After joining a room, the client's socket will contain hold this information for as long as it is in the room. It can be found 
by inspecting the socket, and stored in a varible to more easily identify which room each player is in (for some reason the 
information is held in the keys of the object, not the value, hence the Object.keys method being used to capture it) */

  let room = Object.keys(socket.adapter.sids[socket.id]);
  console.log(`Player has joined room ${room[0]}`);

  /* Sends data to all of the clients in the above socket's room via the 'joinedRoom' event. It contains a message to let them
know which room they have joined, their room id, and both player counters. */

  game.to(`${room[0]}`).emit("joinedRoom", {
    message: `You have joined room ${room[0]}.`,
    id: room[0],
    player1Counter,
    player2Counter,
  });

  /* Sends both player counters to all clients that are connected to the game on the 'updateCounters' event. */

  game.emit("updateCounters", { player1Counter, player2Counter });

  /* Tells each individual player whether they are winning by using their socket id and the checkWinner function on the
  'currentWinner' event. */

  game.to(`${socket.id}`).emit("currentWinner", {
    message: `${checkWinner(socket.id)}`,
  });

  /* Listens for the 'incrementCounter' event from the client. When triggered, it takes in the socket, and uses their id
  to increment the approriate counter by one.  */

  socket.on("incrementCounter", (socket) => {
    console.log(socket);
    if (socket.id === "1") {
      player1Counter++;
    }
    if (socket.id === "2") {
      player2Counter++;
    }
    console.log(player1Counter, player2Counter);

    /* After incrementing the player's counter, the server sends the each client the updated counters and their winning status. */

    game.emit("updateCounters", { player1Counter, player2Counter });
    game.to(`1`).emit("currentWinner", {
      message: `${checkWinner("1")}`,
    });
    game.to(`2`).emit("currentWinner", {
      message: `${checkWinner("2")}`,
    });
  });
});

/* Uses the server that socket.io is using to listen on the specified port. */

server.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
