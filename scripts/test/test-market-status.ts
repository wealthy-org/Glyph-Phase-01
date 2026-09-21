import "dotenv/config";
import { getGlyphDecisionMarketStatus } from "../glyph-decision/trade-cycle/market-gate";

async function main() {
  console.log("Checking US Equity Market Status via Alpha Vantage...");
  const status = await getGlyphDecisionMarketStatus();
  console.log("STATUS RESULT:", JSON.stringify(status, null, 2));
}

main().catch(console.error);
