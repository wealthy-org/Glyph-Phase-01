import { AlphaVantageProvider } from "../../../src/lib/market/alpha-vantage";
import { MarketStatusResult } from "../../../src/types/market";

export async function getGlyphDecisionMarketStatus(): Promise<MarketStatusResult> {
    return new AlphaVantageProvider().getMarketStatus("United States");
}
