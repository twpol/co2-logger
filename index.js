/** @type {any} */
const config = require("./config.json");

// ##### MQTT Home Assistant setup #####

const mqtt = require("mqtt");
const mqttClient = mqtt.connect(config.mqtt.url, config.mqtt);
const mqttTopic = `${config.homeAssistant.topic}/sensor/${config.homeAssistant.deviceName}`;
let mqttConnected = false;

mqttClient.on("connect", () => {
  console.log(`Connected to MQTT ${config.mqtt.url}`);
  mqttClient.publish(
    `${mqttTopic}/${config.homeAssistant.deviceName}-CO2/config`,
    JSON.stringify({
      name: `${config.homeAssistant.deviceName}-CO2`,
      device_class: "carbon_dioxide",
      unit_of_measurement: "ppm",
      state_topic: `${mqttTopic}/state`,
      value_template: "{{ value_json.co2 }}",
      unique_id: `${config.homeAssistant.deviceName}-CO2`,
      device: {
        identifiers: [config.homeAssistant.deviceName],
        name: config.homeAssistant.deviceName,
      },
    })
  );
  mqttClient.publish(
    `${mqttTopic}/${config.homeAssistant.deviceName}-T/config`,
    JSON.stringify({
      name: `${config.homeAssistant.deviceName}-T`,
      device_class: "temperature",
      unit_of_measurement: "°C",
      state_topic: `${mqttTopic}/state`,
      value_template: "{{ value_json.temperature }}",
      unique_id: `${config.homeAssistant.deviceName}-T`,
      device: {
        identifiers: [config.homeAssistant.deviceName],
        name: config.homeAssistant.deviceName,
      },
    })
  );
  mqttConnected = true;
});

mqttClient.on("error", (error) => {
  console.error(error);
});

// ##### CO2 Monitor setup #####

const CO2Monitor = require("co2-monitor");
const co2Monitor = new CO2Monitor();

co2Monitor.on("connected", (device) => {
  co2Monitor.startTransfer();
});

co2Monitor.on("error", (error) => {
  console.error(error);
});

// ##### Main code #####

co2Monitor.on("data", (data) => {
  const json = JSON.parse(data);
  json.temperature = parseFloat(json.temperature);
  json.time = new Date().toISOString();
  console.log(JSON.stringify(json));

  if (mqttConnected) {
    mqttClient.publish(`${mqttTopic}/state`, JSON.stringify(json));
  }
});

co2Monitor.connect();
