// @flow

import type {connection, sendable} from "./types"

export default class Topic {

    name : string;
    pass : string;
    listener : connection[];
    lastId : number;
    data: string[];
  
    constructor(name : string, password : string) {
      this.name = name
      this.pass = password
      this.lastId = 0
      this.listener = []
      this.data = []
    }
  
    join(pass : string, client : sendable) : bool  {
      if (pass === this.pass) {
        const conn = {ws: client, id : this.lastId++}
        this.listener.push(conn)
        return true
      }
      return false
    }
  
    disconnect(id : number) {
      let index = -1
      for(let i = 0; i < this.listener.length; i++) {
        if(this.listener[i].id == id)
          index = i
          break
      }
      if(index >= 0)
        delete this.listener[index]
    }
  
    notify(pass : string, msg : string[]) {
      this.data = msg
      if (pass !== this.pass)  return
      this.listener.forEach((elem) => {
        elem.ws.send(JSON.stringify({type: "data", status: "data", success: true, data: this.getData(), topic: this.name}))
      })
    }
    
    getData() {
      return this.data
    }

    setData(data : string[]) {
      this.data = data
    }

  }