import { Agent, setGlobalDispatcher } from "undici";
import dns from "dns";

const ROBINHOOD_IPS = ["104.20.46.209", "172.66.147.70"];

export function setupDnsFix() {
  if (typeof window !== "undefined") return;

  const agent = new Agent({
    connect: {
      lookup: (hostname, opts, cb) => {
        if (hostname.includes("robinhood.com")) {
          // Bypass ISP DNS hijacking (Telkomsel/Indihome) for Robinhood Chain Testnet
          return (cb as any)(null, [
            { address: ROBINHOOD_IPS[0], family: 4 },
            { address: ROBINHOOD_IPS[1], family: 4 },
          ]);
        }
        dns.lookup(hostname, opts, cb);
      },
    },
  });

  setGlobalDispatcher(agent);
}

setupDnsFix();
