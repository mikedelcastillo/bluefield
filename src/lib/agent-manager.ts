import { findAgentDvrIps } from "./scan"

type Callback = (ips: string[]) => void

export class AgentManager {
  ips: string[] = []
  callback: Callback

  constructor(callback: Callback) {
    this.callback = callback
    setInterval(() => {
      this.scan()
    }, 10000)
  }

  scan() {
    findAgentDvrIps().then(ips => {
      this.ips = ips
      this.callback(ips)
    }).catch()
  }
}