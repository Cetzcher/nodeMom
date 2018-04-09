// @flow

import Topic from "./topic"

export type sendable = {send : (string) => void }
export type connection = { ws : sendable, id : number }
export type topicDict = {[k: string] : Topic}
export type PRequest = {
  action: "subscribe" | "new" | "notify",
  topic: string,
  topicPass: string,
  data?: string[]
}