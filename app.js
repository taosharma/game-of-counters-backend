const express = require("express");
const cors = require("cors");
const PORT = 5000;

const app = express();

const counterRouter = require("./routes/counter");

app.use((request, response, next) => {
  console.log(`${request.method} request received to ${request.url}`);
  next();
});

app.use(cors());

app.use(express.json());

app.use("/counter", counterRouter);

app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
