const express = require("express");
const router = express.Router();

const { getCounter, incrementCounter } = require("../models/counter");

router.get("/", async (request, response) => {
  const counter = await getCounter();
  response.json({
    success: true,
    message: "The counter is in the payload",
    payload: counter
  });
});

router.get("/increment", async (request, response) => {
  await incrementCounter();
  response.json({ success: true, message: "Counter incremented" });
});

module.exports = router;
