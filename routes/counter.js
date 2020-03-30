const express = require("express");
const router = express.Router();

const { getCounter, incrementCounter } = require("../models/counter");

router.get("/increment", async (request, response) => {
  await incrementCounter();
  response.json({ success: true, message: "Counter incremented" });
});

module.exports = router;
