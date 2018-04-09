"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
//      


class Topic {

  constructor(name, password) {
    this.name = name;
    this.pass = password;
    this.lastId = 0;
    this.listener = [];
  }

  join(pass, client) {
    if (pass === this.pass) {
      const conn = { ws: client, id: this.lastId++ };
      this.listener.push(conn);
      return true;
    }
    return false;
  }

  disconnect(id) {
    let index = -1;
    for (let i = 0; i < this.listener.length; i++) {
      if (this.listener[i].id == id) index = i;
      break;
    }
    if (index >= 0) delete this.listener[index];
  }

  notify(pass, msg) {
    if (pass !== this.pass) return;
    this.listener.forEach(elem => {
      elem.ws.send(msg);
    });
  }

}
exports.default = Topic;