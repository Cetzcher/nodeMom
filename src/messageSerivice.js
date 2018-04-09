// @flow

import type { topicDict } from "./types"
import Topic from "./topic"

class MessageService {

    topics : topicDict;

    constructor() {
        this.topics = {}
    }

    createTopic(name : string, pass : string) : boolean {
        if(!this.topics[name]) {
            this.topics[name] = new Topic(name, pass)
            return true
        }
        return false
    }

    getTopic(name : string) : ?Topic {
        return this.topics[name]
    }


}

const MService = new MessageService()
export default MService