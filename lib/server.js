"use strict";

var _topic = require("./topic");

var _topic2 = _interopRequireDefault(_topic);

var _messageSerivice = require("./messageSerivice");

var _messageSerivice2 = _interopRequireDefault(_messageSerivice);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//      


const express = require('express');

function heartbeat() {
  this.isAlive = true;
}

const PORT = process.env.PORT || 42069;
const server = express().use((req, res) => res.send("votem")).listen(PORT, () => console.log(`Listening on ${PORT}`));

const WebSocketServer = require("ws").Server;
const wss = new WebSocketServer({ server });

/**
 * json format:
 * {
 *  action: "subscribe" | "new" | "notify",
 *  topic: string,
 *  topicPass: string,
 *  data: any,
 * }
 */

function handleNew(ws, json) {
  console.log("creating new topic");
  const created = _messageSerivice2.default.createTopic(json.topic, json.topicPass);
  return { status: "creation was:" + String(created) };
}

function handleSubscribe(ws, json) {
  console.log("subscribing");
  const topic = _messageSerivice2.default.getTopic(json.topic);
  if (!topic) return { status: "cannot fetch topic" };
  console.log("fetch successfull");
  const joined = topic.join(json.topicPass, ws);
  return { status: "joined status: " + String(joined) };
}

function handleNotify(ws, json) {
  const topic = _messageSerivice2.default.getTopic(json.topic);
  if (!topic) return { status: "cannot fetch topic" };

  console.log("fetch successfull");

  if (json.data) topic.notify(json.topicPass, json.data);
  return { status: "notify successful" };
}

const actions = {
  "new": handleNew,
  "subscribe": handleSubscribe,
  "notify": handleNotify
};

function handler(ws) {
  return msg => {
    try {
      console.log("read: ", msg);
      const json = JSON.parse(msg);
      console.log("json\n", json);
      const f = actions[json.action];
      if (f) ws.send(JSON.stringify(f(ws, json)));else console.log("the action", json.action, "is not availible");
    } catch (err) {
      console.log(err);
    }
  };
}

wss.on("connection", ws => {
  console.log("Connection accepted");
  ws.isAlive = true;
  const boundFunc = handler(ws);
  ws.on("message", msg => boundFunc(msg));
  ws.on("error", e => console.log(e));
  ws.on('pong', heartbeat);
  ws.on("close", () => boundFunc);
});

const interval = setInterval(() => {
  console.log("pinging clients ...");
  let clients = 0;
  wss.clients.forEach(ws => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(() => null);
    clients++;
  });
  console.log("currently there are ", clients, "active clients");
}, 30000);