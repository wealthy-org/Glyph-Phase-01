import "dotenv/config";
import "../../src/lib/dns-fix";
import {
  createPublicClient,
  http,
  parseAbi,
  decodeEventLog,
  getAddress,
  encodeFunctionData,
} from "viem";
import { robinhoodMainnet } from "../../src/lib/onchain/chains";

const CANONICAL_IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;
const AGENT_URI = "/agents/glyph.json";
const TARGET_GLYPH_WALLET = getAddress(
  process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS ||
  "0x1Ba1BBeC38CAf4454252f8Bd87245a41919dd27C"
);

const identityRegistryAbi = parseAbi([
  "function register(string calldata agentURI) external returns (uint256)",
  "function setAgentWallet(uint256 agentId, address wallet) external",
  "function getAgentWallet(uint256 agentId) external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "event AgentRegistered(uint256 indexed agentId, string agentURI, address indexed owner)",
  "event AgentWalletSet(uint256 indexed agentId, address indexed wallet)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
]);

async function main() {
  const args = process.argv.slice(2);
  const verifyTxIdx = args.indexOf("--verify-tx");
  const verifyIdIdx = args.indexOf("--verify-id");

  const publicClient = createPublicClient({
    chain: robinhoodMainnet,
    transport: http(),
  });

  // Verification mode for a completed MetaMask transaction
  if (verifyTxIdx !== -1 && args[verifyTxIdx + 1]) {
    const txHash = args[verifyTxIdx + 1] as `0x${string}`;
    console.log(`\n🔍 Verifying MetaMask Registration Transaction: ${txHash}...`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log(`✅ Transaction confirmed in Block: ${receipt.blockNumber}`);
    console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}`);

    let registeredAgentId: bigint | null = null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: identityRegistryAbi,
          data: log.data,
          topics: log.topics,
        });
        if (decoded.eventName === "AgentRegistered") {
          registeredAgentId = (decoded.args as any).agentId;
          break;
        }
        if (decoded.eventName === "Transfer") {
          registeredAgentId = (decoded.args as any).tokenId;
        }
      } catch {
        // ignore
      }
    }

    if (registeredAgentId) {
      console.log(`🆔 Minted Mainnet Agent ID: #${registeredAgentId.toString()}`);
      const owner = await publicClient.readContract({
        address: CANONICAL_IDENTITY_REGISTRY,
        abi: identityRegistryAbi,
        functionName: "ownerOf",
        args: [registeredAgentId],
      });
      const wallet = await publicClient.readContract({
        address: CANONICAL_IDENTITY_REGISTRY,
        abi: identityRegistryAbi,
        functionName: "getAgentWallet",
        args: [registeredAgentId],
      });
      const uri = await publicClient.readContract({
        address: CANONICAL_IDENTITY_REGISTRY,
        abi: identityRegistryAbi,
        functionName: "tokenURI",
        args: [registeredAgentId],
      });
      console.log(`👑 Onchain Owner:        ${owner}`);
      console.log(`💼 Onchain Agent Wallet: ${wallet}`);
      console.log(`📄 Token URI:            ${uri}`);
      console.log(`🎯 Matched Target:       ${owner.toLowerCase() === TARGET_GLYPH_WALLET.toLowerCase() ? "YES" : "NO"}`);
    }
    return;
  }

  if (verifyIdIdx !== -1 && args[verifyIdIdx + 1]) {
    const agentId = BigInt(args[verifyIdIdx + 1]);
    console.log(`\n🔍 Verifying Mainnet Agent ID: #${agentId.toString()}...`);
    const owner = await publicClient.readContract({
      address: CANONICAL_IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: "ownerOf",
      args: [agentId],
    });
    const wallet = await publicClient.readContract({
      address: CANONICAL_IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: "getAgentWallet",
      args: [agentId],
    });
    const uri = await publicClient.readContract({
      address: CANONICAL_IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: "tokenURI",
      args: [agentId],
    });
    console.log(`👑 Onchain Owner:        ${owner}`);
    console.log(`💼 Onchain Agent Wallet: ${wallet}`);
    console.log(`📄 Token URI:            ${uri}`);
    return;
  }

  // Preparation & Dry-Run Mode for MetaMask Manual (Option B)
  console.log("\n============================================================");
  console.log("   GLYPH PHASE 04 — MAINNET IDENTITY REGISTRATION (OPTION B)");
  console.log("   MODE: METAMASK MANUAL TRANSACTION PREPARATION");
  console.log("============================================================\n");

  const balanceWei = await publicClient.getBalance({ address: TARGET_GLYPH_WALLET });
  const balanceEth = Number(balanceWei) / 1e18;
  const gasPriceWei = await publicClient.getGasPrice();
  const gasPriceGwei = Number(gasPriceWei) / 1e9;
  const nonce = await publicClient.getTransactionCount({ address: TARGET_GLYPH_WALLET });

  // Encode calldata for register(string)
  const registerCalldata = encodeFunctionData({
    abi: identityRegistryAbi,
    functionName: "register",
    args: [AGENT_URI],
  });

  // Estimate gas for register
  let estGasRegister = BigInt(135000);
  try {
    estGasRegister = await publicClient.estimateContractGas({
      address: CANONICAL_IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: "register",
      args: [AGENT_URI],
      account: TARGET_GLYPH_WALLET,
    });
  } catch {
    // fallback if simulation needs gas buffer
  }

  const estFeeRegisterEth = Number(estGasRegister * gasPriceWei) / 1e18;

  console.log(`🌐 Network:                ${robinhoodMainnet.name} (Chain ID: ${robinhoodMainnet.id})`);
  console.log(`🏛️  IdentityRegistry:       ${CANONICAL_IDENTITY_REGISTRY}`);
  console.log(`👤 Transaction Sender:     ${TARGET_GLYPH_WALLET} (MetaMask EOA)`);
  console.log(`👑 Intended Agent Owner:   ${TARGET_GLYPH_WALLET}`);
  console.log(`💼 Intended Agent Wallet:  ${TARGET_GLYPH_WALLET}`);
  console.log(`💰 MetaMask Mainnet Bal:   ${balanceEth.toFixed(6)} ETH`);
  console.log(`🔢 MetaMask Nonce:         ${nonce}`);
  console.log(`⛽ Current Gas Price:      ${gasPriceGwei.toFixed(4)} Gwei\n`);

  console.log("------------------------------------------------------------");
  console.log("TRANSACTION 1 — REGISTER AGENT IDENTITY (METAMASK)");
  console.log("------------------------------------------------------------");
  console.log(`To (Contract):    ${CANONICAL_IDENTITY_REGISTRY}`);
  console.log(`From (Sender):    ${TARGET_GLYPH_WALLET}`);
  console.log(`Value:            0 ETH`);
  console.log(`Function:         register(string calldata agentURI)`);
  console.log(`Argument:         "${AGENT_URI}"`);
  console.log(`Calldata (Hex):   ${registerCalldata}`);
  console.log(`Estimated Gas:    ${estGasRegister.toString()} units`);
  console.log(`Estimated Fee:    ~${estFeeRegisterEth.toFixed(8)} ETH (~$0.00002 USD)\n`);

  console.log("------------------------------------------------------------");
  console.log("TRANSACTION 2 — BIND AGENT WALLET (IF NOT AUTO-SET)");
  console.log("------------------------------------------------------------");
  console.log(`Note: Calling register() from MetaMask directly sets ownerOf(agentId) = ${TARGET_GLYPH_WALLET}.`);
  console.log(`Function:         setAgentWallet(uint256 agentId, address wallet)`);
  console.log(`Arguments:        [<mintedAgentId>, "${TARGET_GLYPH_WALLET}"]`);
  console.log(`Estimated Gas:    ~45,000 units`);
  console.log(`Estimated Fee:    ~0.00000231 ETH\n`);

  console.log("------------------------------------------------------------");
  console.log("🛑 SAFETY CHECK: NO TRANSACTION WAS BROADCAST");
  console.log("Private key of MetaMask wallet is NEVER stored or requested.");
  console.log("All actions await explicit user approval & manual MetaMask signature.");
  console.log("------------------------------------------------------------\n");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
