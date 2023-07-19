import axios from "axios";
import { networkInterfaces } from "os";

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
  return ips
}

export const findIps = async (ip0: number, ip1: number, ip2: number, port: number, path: string, check: (data: any) => boolean) => {
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
            timeout: 2500,
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

const run = async () => {
  const ip = getMyIps()[0]
  if (typeof ip === "undefined") throw new Error("no ip")
  const ipParts = ip.split(".").map(n => Number(n)).slice(0, 3)
  const found = await findIps(ipParts[0], ipParts[1], ipParts[2], 8090, "", (data) => {
    if (typeof data !== "string") return false
    return !!data.match(/ispy/i) && !!data.match(/agent/i)
  })
  console.clear()
  console.log(found)
}

run()