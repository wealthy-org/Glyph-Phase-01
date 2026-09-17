import { TradeDecisionDetail } from "./types";

export const TRADE_DECISION_DETAILS: Record<string, TradeDecisionDetail> = {
  "0012": {
    id: "0012",
    tradeNumber: "TRADE #0012",
    recordLabel: "DECISION RECORD",
    asset: "NVDA",
    action: "LONG",
    leverage: "2×",
    leverageLabel: "2× SIMULATED LEVERAGE",
    resultPercent: "+8.4%",
    isPositive: true,
    status: "CLOSED",
    entryPrice: "$172.40",
    exitPrice: "$186.90",
    pnlValue: "+$104.21",
    decisionThesis:
      "Revenue growth and AI infrastructure demand continue to support the long thesis, while valuation and volatility remain the primary risks.",
    fundamentalAnalysis: {
      title: "Fundamental Analysis",
      description: "Revenue growth and AI infrastructure demand remained strong.",
      score: 78,
      maxScore: 100,
    },
    technicalAnalysis: {
      title: "Technical Analysis",
      description: "Trend structure remained bullish.",
      score: 84,
      maxScore: 100,
    },
    catalyst: "Upcoming earnings and continued AI demand.",
    riskScore: 61,
    invalidationLevel: "NVDA closes below $168.",
    onchainProof: {
      txHash: "0x8f3c71a3962d8544e390c9b0e1df59b3291ac",
      network: "ROBINHOOD CHAIN TESTNET",
      explorerUrl: "https://explorer.testnet.chain.robinhood.com/tx/0x8f3c71a3962d8544e390c9b0e1df59b3291ac",
    },
    memory: {
      outcome: "WIN",
      thesisResult: "CORRECT",
      lesson:
        "Breakout confirmation combined with strong earnings momentum produced a favorable result. Invalidation level preserved downside risk.",
      confidenceCalibration: "GOOD",
      adaptation:
        "Reinforce high-conviction momentum thesis patterns for tier-1 semiconductor leaders.",
      weightShift: "+3.8% Momentum / +2.1% Catalyst Alignment",
    },
  },
  "nvda-sep17": {
    id: "nvda-sep17",
    tradeNumber: "TRADE #0012",
    recordLabel: "DECISION RECORD",
    asset: "NVDA",
    action: "LONG",
    leverage: "2×",
    leverageLabel: "2× SIMULATED LEVERAGE",
    resultPercent: "+8.4%",
    isPositive: true,
    status: "CLOSED",
    entryPrice: "$172.40",
    exitPrice: "$186.90",
    pnlValue: "+$104.21",
    decisionThesis:
      "Revenue growth and AI infrastructure demand continue to support the long thesis, while valuation and volatility remain the primary risks.",
    fundamentalAnalysis: {
      title: "Fundamental Analysis",
      description: "Revenue growth and AI infrastructure demand remained strong.",
      score: 78,
      maxScore: 100,
    },
    technicalAnalysis: {
      title: "Technical Analysis",
      description: "Trend structure remained bullish.",
      score: 84,
      maxScore: 100,
    },
    catalyst: "Upcoming earnings and continued AI demand.",
    riskScore: 61,
    invalidationLevel: "NVDA closes below $168.",
    onchainProof: {
      txHash: "0x8f3c71a3962d8544e390c9b0e1df59b3291ac",
      network: "ROBINHOOD CHAIN TESTNET",
      explorerUrl: "https://sepolia.basescan.org/tx/0x8f3c71a3962d8544e390c9b0e1df59b3291ac",
    },
  },
  "btc-sep14": {
    id: "btc-sep14",
    tradeNumber: "TRADE #0011",
    recordLabel: "DECISION RECORD",
    asset: "BTC",
    action: "LONG",
    leverage: "1×",
    leverageLabel: "1× SIMULATED LEVERAGE",
    resultPercent: "+2.1%",
    isPositive: true,
    status: "CLOSED",
    entryPrice: "$66,820.00",
    exitPrice: "$68,240.00",
    pnlValue: "+$42.60",
    decisionThesis:
      "Institutional ETF net inflows crossed positive inflection threshold with macro liquidity expansion offsetting short-term overhead supply.",
    fundamentalAnalysis: {
      title: "Fundamental Analysis",
      description: "ETF inflow volume expanded 14% week-over-week across primary issuers.",
      score: 82,
      maxScore: 100,
    },
    technicalAnalysis: {
      title: "Technical Analysis",
      description: "Reclaimed 50-day moving average with high volume confirmation.",
      score: 76,
      maxScore: 100,
    },
    catalyst: "FOMC rate policy announcement and stablecoin supply expansion.",
    riskScore: 48,
    invalidationLevel: "BTC breaks below $65,200 support line.",
    onchainProof: {
      txHash: "0x7a2d8e319c50a1b98150247f9b9326eb8f0312bd",
      network: "ROBINHOOD CHAIN TESTNET",
      explorerUrl: "https://sepolia.basescan.org/tx/0x7a2d8e319c50a1b98150247f9b9326eb8f0312bd",
    },
  },
  "eth-sep10": {
    id: "eth-sep10",
    tradeNumber: "TRADE #0010",
    recordLabel: "DECISION RECORD",
    asset: "ETH",
    action: "SHORT",
    leverage: "1×",
    leverageLabel: "1× SIMULATED LEVERAGE",
    resultPercent: "-2.3%",
    isPositive: false,
    status: "CLOSED",
    entryPrice: "$3,540.00",
    exitPrice: "$3,620.00",
    pnlValue: "-$22.40",
    decisionThesis:
      "L2 fee migration and low mainnet burn velocity indicated weakened monetary velocity, creating temporary downward pressure against benchmark.",
    fundamentalAnalysis: {
      title: "Fundamental Analysis",
      description: "Blob transaction throughput reduced base layer gas burn rates.",
      score: 64,
      maxScore: 100,
    },
    technicalAnalysis: {
      title: "Technical Analysis",
      description: "Bearish divergence on 4h RSI failed to break lower support.",
      score: 52,
      maxScore: 100,
    },
    catalyst: "Protocol upgrade telemetry and quarterly staking unlock.",
    riskScore: 72,
    invalidationLevel: "ETH breaks and holds above $3,600 resistance.",
    onchainProof: {
      txHash: "0x3c9f1a287b40a8b98150247f9b9326eb8f0376fe",
      network: "ROBINHOOD CHAIN TESTNET",
      explorerUrl: "https://sepolia.basescan.org/tx/0x3c9f1a287b40a8b98150247f9b9326eb8f0376fe",
    },
  },
  "sol-sep08": {
    id: "sol-sep08",
    tradeNumber: "TRADE #0009",
    recordLabel: "DECISION RECORD",
    asset: "SOL",
    action: "LONG",
    leverage: "1.5×",
    leverageLabel: "1.5× SIMULATED LEVERAGE",
    resultPercent: "+13.1%",
    isPositive: true,
    status: "CLOSED",
    entryPrice: "$132.50",
    exitPrice: "$144.10",
    pnlValue: "+$118.80",
    decisionThesis:
      "DEX volume leadership and consumer application fee generation outpaced competing L1 ecosystems with validator stability proving resilient.",
    fundamentalAnalysis: {
      title: "Fundamental Analysis",
      description: "Decentralized exchange volume sustained 40%+ market share across active chains.",
      score: 88,
      maxScore: 100,
    },
    technicalAnalysis: {
      title: "Technical Analysis",
      description: "Clean breakout from multi-week ascending triangle with rising momentum.",
      score: 91,
      maxScore: 100,
    },
    catalyst: "Breakpoint conference keynote releases and Firedancer testnet rollout.",
    riskScore: 55,
    invalidationLevel: "SOL breaks below $128 swing low.",
    onchainProof: {
      txHash: "0x5e1b4c920a30a8b98150247f9b9326eb8f0343aa",
      network: "ROBINHOOD CHAIN TESTNET",
      explorerUrl: "https://sepolia.basescan.org/tx/0x5e1b4c920a30a8b98150247f9b9326eb8f0343aa",
    },
  },
  "msft-sep05": {
    id: "msft-sep05",
    tradeNumber: "TRADE #0008",
    recordLabel: "DECISION RECORD",
    asset: "MSFT",
    action: "LONG",
    leverage: "1×",
    leverageLabel: "1× SIMULATED LEVERAGE",
    resultPercent: "+1.8%",
    isPositive: true,
    status: "CLOSED",
    entryPrice: "$418.20",
    exitPrice: "$425.80",
    pnlValue: "+$23.30",
    decisionThesis:
      "Enterprise Azure AI enterprise workload expansion signaled durable margin expansion in commercial cloud revenue.",
    fundamentalAnalysis: {
      title: "Fundamental Analysis",
      description: "Enterprise software renewal rates remained at historical highs with expanding ACV.",
      score: 80,
      maxScore: 100,
    },
    technicalAnalysis: {
      title: "Technical Analysis",
      description: "Rebound off 100-day EMA support with contracting volatility bands.",
      score: 73,
      maxScore: 100,
    },
    catalyst: "Copilot enterprise adoption metric release and partner summit.",
    riskScore: 42,
    invalidationLevel: "MSFT closes below $412.",
    onchainProof: {
      txHash: "0x1f8c2b763e20a8b98150247f9b9326eb8f0388cc",
      network: "ROBINHOOD CHAIN TESTNET",
      explorerUrl: "https://sepolia.basescan.org/tx/0x1f8c2b763e20a8b98150247f9b9326eb8f0388cc",
    },
  },
};

export function getTradeDetail(id: string): TradeDecisionDetail {
  const normalizedId = id.toLowerCase().replace(/^trade-/, "");
  if (TRADE_DECISION_DETAILS[normalizedId]) {
    return TRADE_DECISION_DETAILS[normalizedId];
  }

  // Check by matching asset or prefix
  const matchingKey = Object.keys(TRADE_DECISION_DETAILS).find(
    (key) => key.toLowerCase() === normalizedId || normalizedId.startsWith(key)
  );

  if (matchingKey) {
    return TRADE_DECISION_DETAILS[matchingKey];
  }

  // Default to reference trade #0012
  return TRADE_DECISION_DETAILS["0012"];
}
