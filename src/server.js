// @flow

import type {sendable, connection, topicDict, PRequest} from "./types"
import Topic from "./topic"
import MessageService from "./messageSerivice"
const express : any = require('express');


function heartbeat() {
  this.isAlive = true;
}


const PORT = process.env.PORT || 42069
const server = express()
  .use((req, res) => res.send("votem") )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

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

function handleNew  (ws : sendable, json : PRequest) : Object {
  console.log("creating new topic")
  const created = MessageService.createTopic(json.topic, json.topicPass)
  return {
    status: "creation was:" + String(created), 
    type: "new", 
    success: created, 
    topic: json.topic
  }
}


function handleSubscribe  (ws : sendable, json : PRequest) : Object {
  console.log("subscribing")
  const topic = MessageService.getTopic(json.topic)
  if(!topic)
    return {status: "cannot fetch topic", type: "subscribe", success: false}
  console.log("fetch successfull");
  const joined = topic.join(json.topicPass, ws)
  const rt : Object = {
    status: "joined status: " + String(joined), 
    type: "subscribe", 
    success: joined, 
    topic: topic.name
  }
  if(joined)
    rt["data"] = topic.getData()
  return rt
}


function handleNotify  (ws : sendable, json : PRequest) : Object {
  const topic = MessageService.getTopic(json.topic)
  if(!topic)
    return {status: "cannot fetch topic", type: "notify", success: false}

  console.log("fetch successfull");
  
  if (json.data)
    topic.notify(json.topicPass, json.data)
  return {
    status: "notify successful",
    type: "notify", 
    success: true, 
    topic: topic.name
  }
  
}


const actions = {
  "new": handleNew,
  "subscribe": handleSubscribe,
  "notify": handleNotify
}


function handler(ws : sendable) {
  return (msg : string) => {
    try {
      console.log("read: ", msg)
      const json : PRequest = JSON.parse(msg)
      console.log("json\n", json);
      const f = actions[json.action]
      if(f)
        ws.send(JSON.stringify(f(ws, json)))
      else
        console.log("the action", json.action, "is not availible")
    } catch (err) {
      console.log(err);
    }
  }
}

wss.on("connection", (ws) => {
  console.log("Connection accepted")
  ws.isAlive = true;
  const boundFunc = handler(ws)
  ws.on("message", (msg) => boundFunc(msg))
  ws.on("error", e => console.log(e))
  ws.on('pong', heartbeat);
  ws.on("close", () => boundFunc)

});

const interval = setInterval(() => {
  console.log("pinging clients ...")
  let clients = 0
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false)
      return ws.terminate();
    ws.isAlive = false;
    ws.ping(() => null);
    clients++
  });
  console.log("currently there are ", clients, "active clients")
}, 30000);
