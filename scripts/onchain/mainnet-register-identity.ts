import "dotenv/config";
import "../../src/lib/dns-fix";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  decodeEventLog,
  getAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
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

async function checkOrExecute() {
  const isExecute = process.argv.includes("--execute");

  console.log("\n============================================================");
  console.log("   GLYPH PHASE 04 — MAINNET IDENTITY & WALLET BINDING");
  console.log("============================================================\n");

  const privateKey = process.env.SMART_ACCOUNT_OWNER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey || !privateKey.startsWith("0x")) {
    throw new Error("SMART_ACCOUNT_OWNER_PRIVATE_KEY is missing or invalid in .env");
  }

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain: robinhoodMainnet,
    transport: http(),
  });

  const balanceWei = await publicClient.getBalance({ address: account.address });
  const balanceEth = Number(balanceWei) / 1e18;
  const gasPriceWei = await publicClient.getGasPrice();
  const gasPriceGwei = Number(gasPriceWei) / 1e9;

  console.log(`🌐 Network:            ${robinhoodMainnet.name} (Chain ID: ${robinhoodMainnet.id})`);
  console.log(`🏛️  IdentityRegistry:   ${CANONICAL_IDENTITY_REGISTRY}`);
  console.log(`👤 Signer EOA:         ${account.address}`);
  console.log(`💼 Glyph Target Wallet: ${TARGET_GLYPH_WALLET} (User MetaMask EOA)`);
  console.log(`💰 Signer Balance:     ${balanceEth.toFixed(6)} ETH`);
  console.log(`⛽ Gas Price:          ${gasPriceGwei.toFixed(4)} Gwei`);
  console.log(`📝 Step 1 Function:    register("${AGENT_URI}")`);
  console.log(`🔗 Step 2 Function:    setAgentWallet(agentId, ${TARGET_GLYPH_WALLET})\n`);

  // Estimate Gas for register
  let estGasRegister: bigint = BigInt(35000);
  try {
    estGasRegister = await publicClient.estimateContractGas({
      address: CANONICAL_IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: "register",
      args: [AGENT_URI],
      account: account.address,
    });
    console.log(`📊 Est. Gas (register):       ${estGasRegister.toString()} units`);
  } catch (err: any) {
    console.log(`⚠️  Gas Estimation (register): ${err?.message || err}`);
  }

  // Estimated Gas for setAgentWallet (~45,000 gas)
  const estGasSetWallet = BigInt(45000);
  console.log(`📊 Est. Gas (setAgentWallet): ~${estGasSetWallet.toString()} units`);
  const totalEstGas = estGasRegister + estGasSetWallet;
  const estTotalFeeEth = Number(totalEstGas * gasPriceWei) / 1e18;
  console.log(`💸 Total Est. L2 Fee:         ~${estTotalFeeEth.toFixed(8)} ETH\n`);

  if (!isExecute) {
    console.log("------------------------------------------------------------");
    console.log("🛑 DRY-RUN COMPLETE. STOPPING BEFORE TRANSACTION BROADCAST.");
    console.log("NO transaction was sent.");
    console.log("Run with --execute ONLY after human approval.");
    console.log("------------------------------------------------------------\n");
    return;
  }

  if (balanceWei === BigInt(0)) {
    console.error("❌ ERROR: Signer balance is 0 ETH. Please fund wallet before executing.\n");
    process.exit(1);
  }

  console.log("🚀 Step 1: Broadcasting registration transaction to Mainnet...");
  const walletClient = createWalletClient({
    account,
    chain: robinhoodMainnet,
    transport: http(),
  });

  const txHash = await walletClient.writeContract({
    address: CANONICAL_IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: "register",
    args: [AGENT_URI],
  });

  console.log(`⏳ Register Tx Hash: ${txHash}`);
  console.log("⏳ Waiting for block confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
    timeout: 60000,
  });

  console.log(`✅ Register confirmed in block: ${receipt.blockNumber}`);
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

  if (!registeredAgentId) {
    throw new Error("Could not determine minted agentId from transaction logs.");
  }

  console.log(`🆔 Minted Mainnet Agent ID: #${registeredAgentId.toString()}`);

  // Step 2: Bind Agent Wallet to target MetaMask address
  console.log(`\n🚀 Step 2: Binding Agent ID #${registeredAgentId.toString()} to wallet: ${TARGET_GLYPH_WALLET}...`);
  const setWalletTxHash = await walletClient.writeContract({
    address: CANONICAL_IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: "setAgentWallet",
    args: [registeredAgentId, TARGET_GLYPH_WALLET],
  });

  console.log(`⏳ SetAgentWallet Tx Hash: ${setWalletTxHash}`);
  const setReceipt = await publicClient.waitForTransactionReceipt({
    hash: setWalletTxHash,
    timeout: 60000,
  });
  console.log(`✅ Wallet binding confirmed in block: ${setReceipt.blockNumber}`);

  // Verification
  const onchainWallet = await publicClient.readContract({
    address: CANONICAL_IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: "getAgentWallet",
    args: [registeredAgentId],
  });

  console.log("\n============================================================");
  console.log(`🎉 GLYPH IDENTITY CONFIGURED ON ROBINHOOD MAINNET!`);
  console.log(`🆔 Agent ID:             #${registeredAgentId.toString()}`);
  console.log(`💼 Onchain Agent Wallet: ${onchainWallet}`);
  console.log(`✅ Wallet Match:         ${onchainWallet.toLowerCase() === TARGET_GLYPH_WALLET.toLowerCase() ? "YES" : "NO"}`);
  console.log(`🔗 Register Tx:          https://robinhoodchain.blockscout.com/tx/${txHash}`);
  console.log(`🔗 Set Wallet Tx:        https://robinhoodchain.blockscout.com/tx/${setWalletTxHash}`);
  console.log("============================================================\n");
}

checkOrExecute().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
