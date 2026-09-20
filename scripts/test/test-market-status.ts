import "dotenv/config";
import { TwelveDataProvider } from "../../src/lib/market/twelve-data";

async function main() {
  console.log("Checking US Market Status via Twelve Data Provider...");
  const provider = new TwelveDataProvider();
  const status = await provider.getMarketStatus("United States");
  console.log("STATUS RESULT:", JSON.stringify(status, null, 2));
}

main().catch(console.error);
