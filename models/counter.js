let counter = 0;

async function getCounter() {
  const data = await counter;
  return data;
}

async function incrementCounter() {
  counter++;
}

module.exports = { getCounter, incrementCounter };
