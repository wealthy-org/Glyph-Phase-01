import "dotenv/config";
import { AlphaVantageProvider } from "../../src/lib/market/alpha-vantage";

async function main() {
  console.log("Checking US Market Status via Alpha Vantage Provider...");
  const provider = new AlphaVantageProvider();
  const status = await provider.getMarketStatus("United States");
  console.log("STATUS RESULT:", JSON.stringify(status, null, 2));
}

main().catch(console.error);
