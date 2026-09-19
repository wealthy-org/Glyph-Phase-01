import "dotenv/config";
import "../../src/lib/dns-fix";
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseEther,
  formatEther,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// Old wallet private key (the one that has ETH)
const OLD_PRIVATE_KEY = "0x18a6894227c84396e371e9b664a376e327b6e33cc43fa9a6bb45d53ef1d6a912" as `0x${string}`;

// New wallet address (destination)
const NEW_WALLET_ADDRESS = process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS as `0x${string}`;

const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.testnet.chain.robinhood.com",
      ],
    },
  },
});

async function main() {
  console.log("\n💸 TRANSFERRING TEST ETH TO NEW GLYPH WALLET");
  console.log("═══════════════════════════════════════════════════════\n");

  const oldAccount = privateKeyToAccount(OLD_PRIVATE_KEY);
  console.log(`  From (old wallet): ${oldAccount.address}`);
  console.log(`  To (new wallet):   ${NEW_WALLET_ADDRESS}`);

  if (!NEW_WALLET_ADDRESS) {
    throw new Error("NEXT_PUBLIC_GLYPH_WALLET_ADDRESS not set in .env");
  }

  const publicClient = createPublicClient({
    chain: robinhoodTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account: oldAccount,
    chain: robinhoodTestnet,
    transport: http(),
  });

  // Check old wallet balance
  const oldBalance = await publicClient.getBalance({ address: oldAccount.address });
  console.log(`\n  Old wallet balance: ${formatEther(oldBalance)} ETH`);

  if (oldBalance === BigInt(0)) {
    console.log("  ⚠️  Old wallet has 0 ETH. Skipping transfer.");
    console.log("  → Use Robinhood Chain Testnet faucet to fund the new wallet instead.");
    return;
  }

  // Transfer 80% of old balance (keep some for gas on old wallet)
  const transferAmount = (oldBalance * BigInt(80)) / BigInt(100);
  console.log(`  Transfer amount:   ${formatEther(transferAmount)} ETH (80% of balance)\n`);

  const tx = await walletClient.sendTransaction({
    to: NEW_WALLET_ADDRESS,
    value: transferAmount,
  });

  console.log(`  ⏳ Transaction sent: ${tx}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx, timeout: 20000 });
  console.log(`  ✅ Confirmed in block: ${receipt.blockNumber}`);

  // Verify new balance
  const newBalance = await publicClient.getBalance({ address: NEW_WALLET_ADDRESS });
  console.log(`\n  New wallet balance: ${formatEther(newBalance)} ETH`);
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Transfer failed:", e.message || e);
    process.exit(1);
  });
