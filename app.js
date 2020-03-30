const express = require("express");
const cors = require("cors");

const PORT = 5000;

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const counterRouter = require("./routes/counter");

let counter = 0;

app.use(cors());

app.use(express.json());

io.on("connection", function(socket) {
  socket.emit("counter", counter);
  socket.on("increment counter", function(data) {
    console.log("hello");
    counter++;
    io.emit("counter", counter);
  });
});

app.use("/counter", counterRouter);

server.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
