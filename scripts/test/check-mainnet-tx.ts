import "dotenv/config";
import https from "node:https";

const txHash = "0x40191a87bf8f6c04488d997ac651bbb85b883c84165ec5a06f639195780d9978";

function rpcCall(method: string, params: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    });

    const req = https.request(
      {
        host: "104.20.46.209",
        port: 443,
        path: "/",
        method: "POST",
        servername: "rpc.mainnet.chain.robinhood.com",
        headers: {
          "Host": "rpc.mainnet.chain.robinhood.com",
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error("Failed to parse body: " + body));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log("=== CHECKING TRANSACTION ON ROBINHOOD MAINNET ===");
  const [txRes, receiptRes] = await Promise.all([
    rpcCall("eth_getTransactionByHash", [txHash]),
    rpcCall("eth_getTransactionReceipt", [txHash]),
  ]);

  console.log("Transaction:", JSON.stringify(txRes.result, null, 2));
  console.log("Receipt:", JSON.stringify(receiptRes.result, null, 2));
}

main().catch(console.error);
