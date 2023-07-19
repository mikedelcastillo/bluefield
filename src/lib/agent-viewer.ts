import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { AgentManager } from "./agent-manager";

export class AgentViewer {
  proc: ChildProcessWithoutNullStreams | undefined
  ip: string | undefined
  manager: AgentManager

  constructor() {
    this.manager = new AgentManager((ips) => {
      const newIp = ips.pop()
      if (this.ip !== newIp) {
        // stop start
        this.ip = newIp
        console.clear()
        console.log(`Viewing ${this.ip}`)
        if (typeof this.proc !== "undefined") {
          this.proc.kill("SIGINT")
        }
        if (typeof this.ip !== "undefined") {
          this.proc = spawn("firefox", ["--kiosk", `http://${this.ip}:8090/`], {
            env: {
              "DISPLAY": ":0",
            }
          })
        } else this.proc = undefined
      }
    })
  }
}