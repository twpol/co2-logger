const CO2Monitor = require("co2-monitor");

const co2Monitor = new CO2Monitor();

co2Monitor.on("connected", (device) => {
  co2Monitor.startTransfer();
});

co2Monitor.on("error", (error) => {
  console.error(error);
});

co2Monitor.on("data", (data) => {
  const json = JSON.parse(data);
  json.temperature = parseFloat(json.temperature);
  json.time = new Date().toISOString();
  console.log(JSON.stringify(json));
});

co2Monitor.connect();
