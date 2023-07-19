import axios from "axios";
import { networkInterfaces } from "os";
import { AGENT_DVR_PATH, AGENT_DVR_PORT } from "../constants";

export const getMyIps = () => {
  const ips: string[] = []
  const netInts = networkInterfaces()
  for (const netIntId in netInts) {
    const netInt = netInts[netIntId]
    if (typeof netInt === "undefined") continue
    for (const conn of netInt) {
      if (conn.family === "IPv4" && !conn.internal) {
        const ip = conn.cidr?.split("/")[0]
        if (typeof ip === "string" && ip.length > "0.0.0.0".length)
          ips.push(ip)
      }
    }
  }
  return Array.from(new Set(ips))
}

export const scan = async (ip0: number, ip1: number, ip2: number, port: number, path: string, check: (data: any) => boolean) => {
  const MAX_VAL = 255
  const BATCH = 20
  const foundIps: string[] = []
  const log = (message: string) => {
    console.log(`[ip-scan]: ${message}`)
  }
  for (let b = 0; b <= MAX_VAL; b += BATCH) {
    const batch: Promise<boolean>[] = []
    for (let i = 0; i <= Math.min(BATCH, MAX_VAL - b); i++) {
      const ip = [ip0, ip1, ip2, b + i].join(".")
      const url = `http://${ip}:${port}/${path}`
      batch.push(new Promise<boolean>(async (resolve) => {
        log(`loading ${url}`)
        try {
          const { data } = await axios.get(url, {
            timeout: 100,
          })
          if (check(data)) {
            log(`found ${ip}`)
            foundIps.push(ip)
            return resolve(true)
          } else {
            log(`found ${ip} but failed check`)
          }
        } catch (e) {
          log(`error ${ip}`)
        }
        resolve(false)
      }))
    }
    await Promise.all(batch)
  }
  return foundIps
}

export const scanIp3 = async (port: number, path: string, check: Parameters<typeof scan>["5"]) => {
  const foundIps: string[] = []
  const myIps = getMyIps()
  const scannedIp3s: number[] = []
  for (const ipStr of myIps) {
    const ipParts = ipStr.split(".").map(n => Number(n) || 0)
    const [a, b, c] = ipParts
    if (scannedIp3s.includes(c)) continue
    scannedIp3s.push(c)
    if (ipParts.length < 4) continue
    const found = await scan(a, b, c, port, path, check)
    foundIps.push(...found)
  }
  return Array.from(new Set(foundIps))
}

export const findAgentDvrIps = () => scanIp3(AGENT_DVR_PORT, AGENT_DVR_PATH, (data) => {
  if (typeof data !== "string") return false
  return !!data.match(/ispy/i) && !!data.match(/agent/i)
})