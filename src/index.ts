import { Role } from "./constants";
import { AgentViewer } from "./lib/agent-viewer";

const { BLUEFIELD_ROLE } = process.env

if (typeof BLUEFIELD_ROLE === "undefined") {
  console.log("`BLUEFIELD_ROLE` was not set")
  process.exit()
}

if (BLUEFIELD_ROLE === Role.CLIENT) {
  new AgentViewer()
}