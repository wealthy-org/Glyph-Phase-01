import "dotenv/config";
import "../src/lib/dns-fix";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  defineChain,
  decodeEventLog,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { prisma } from "../src/lib/prisma";

// Definisi Robinhood Chain Testnet
const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.testnet.chain.robinhood.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: process.env.BLOCK_EXPLORER_URL || "https://explorer.testnet.chain.robinhood.com",
    },
  },
});

const identityRegistryAbi = parseAbi([
  "function register(string calldata agentURI) external returns (uint256)",
  "function setAgentWallet(uint256 agentId, address wallet) external",
  "function getAgentWallet(uint256 agentId) external view returns (address)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "event AgentRegistered(uint256 indexed agentId, string agentURI, address indexed owner)",
  "event AgentWalletSet(uint256 indexed agentId, address indexed wallet)",
]);

async function main() {
  console.log("\n🚀 [GLYPH] Memulai registrasi identitas on-chain (ERC-8004)...");
  console.log("   Mode: FRESH REGISTRATION (wallet baru)\n");

  const contractAddress = process.env.IDENTITY_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;
  const privateKey = process.env.SMART_ACCOUNT_OWNER_PRIVATE_KEY as `0x${string}`;
  const glyphWallet = process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS as `0x${string}`;
  const agentURI = "/agents/glyph.json";

  if (!contractAddress || !privateKey || !glyphWallet) {
    throw new Error("Mohon lengkapi IDENTITY_REGISTRY_CONTRACT_ADDRESS, SMART_ACCOUNT_OWNER_PRIVATE_KEY, dan NEXT_PUBLIC_GLYPH_WALLET_ADDRESS di .env");
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`👤 Signer Address: ${account.address}`);
  console.log(`🏛️  Kontrak IdentityRegistry: ${contractAddress}`);
  console.log(`💼 Glyph Wallet Address: ${glyphWallet}`);

  const publicClient = createPublicClient({
    chain: robinhoodTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: robinhoodTestnet,
    transport: http(),
  });

  // =========================================================================
  // STEP 1: Register Identity On-Chain (Always register new)
  // =========================================================================
  console.log(`\n📝 Memanggil register("${agentURI}")...`);

  const registerTxHash = await walletClient.writeContract({
    address: contractAddress,
    abi: identityRegistryAbi,
    functionName: "register",
    args: [agentURI],
  });

  console.log(`⏳ Menunggu konfirmasi transaksi: ${registerTxHash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: registerTxHash, timeout: 30000 });
  console.log(`✅ Registrasi berhasil di blok: ${receipt.blockNumber}`);

  // Parse agentId from event log
  let agentIdBigInt: bigint = BigInt(1);
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: identityRegistryAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "AgentRegistered") {
        agentIdBigInt = (decoded.args as any).agentId;
        console.log(`🆔 Agent ID dari event: #${agentIdBigInt}`);
        break;
      }
    } catch {
      // Skip non-matching logs
    }
  }

  console.log(`🆔 Menggunakan Agent ID: #${agentIdBigInt}`);

  // =========================================================================
  // STEP 2: Set Agent Wallet On-Chain
  // =========================================================================
  let setWalletTxHash: string | undefined;
  try {
    const currentWallet = await publicClient.readContract({
      address: contractAddress,
      abi: identityRegistryAbi,
      functionName: "getAgentWallet",
      args: [agentIdBigInt],
    });

    if (currentWallet.toLowerCase() !== glyphWallet.toLowerCase()) {
      console.log(`🔗 Menghubungkan dompet agen ke on-chain: ${glyphWallet}...`);
      setWalletTxHash = await walletClient.writeContract({
        address: contractAddress,
        abi: identityRegistryAbi,
        functionName: "setAgentWallet",
        args: [agentIdBigInt, glyphWallet],
      });
      await publicClient.waitForTransactionReceipt({ hash: setWalletTxHash as `0x${string}` });
      console.log(`✅ Dompet agen berhasil dihubungkan: ${setWalletTxHash}`);
    } else {
      console.log(`ℹ️  Dompet agen on-chain sudah sesuai: ${currentWallet}`);
    }
  } catch (err: unknown) {
    console.warn("⚠️  Peringatan saat memeriksa wallet on-chain:", err instanceof Error ? err.message : String(err));
  }

  // =========================================================================
  // STEP 3: Save to Database
  // =========================================================================
  let agentRecord = await prisma.agent.findFirst();
  if (agentRecord) {
    agentRecord = await prisma.agent.update({
      where: { id: agentRecord.id },
      data: {
        agentId: String(agentIdBigInt),
        name: "Glyph",
        status: "ACTIVE",
        metadataUri: agentURI,
      },
    });
  } else {
    agentRecord = await prisma.agent.create({
      data: {
        agentId: String(agentIdBigInt),
        name: "Glyph",
        status: "ACTIVE",
        metadataUri: agentURI,
      },
    });
  }

  console.log(`✅ Data Agent disimpan (ID DB: ${agentRecord.id}, agentId: #${agentRecord.agentId})`);

  // Simpan Agent Wallet
  const walletRecord = await prisma.agentWallet.upsert({
    where: { agentId: agentRecord.id },
    update: {
      walletAddress: glyphWallet,
      network: "Robinhood Chain Testnet",
      chainId: 46630,
    },
    create: {
      agentId: agentRecord.id,
      walletAddress: glyphWallet,
      network: "Robinhood Chain Testnet",
      chainId: 46630,
    },
  });

  console.log(`✅ Data Agent Wallet disimpan: ${walletRecord.walletAddress}`);

  // Simpan Default Policy
  await prisma.agentPolicy.upsert({
    where: { agentId: agentRecord.id },
    update: {},
    create: {
      agentId: agentRecord.id,
      maxPositionPercent: 10,
      maxLeverage: 2,
      maxDailyLossPercent: 5,
      maxOpenPositions: 3,
      minConfidence: 60,
      allowedAssets: ["NVDA", "BTC", "ETH", "SOL", "MSFT"],
      simulatedFeePercent: 0.1,
    },
  });
  console.log("✅ Data Agent Policy tersimpan (max leverage 2x, fee 0.1%)");

  // Inisialisasi Reputation Metrics
  await prisma.reputationMetrics.upsert({
    where: { agentId: agentRecord.id },
    update: {},
    create: {
      agentId: agentRecord.id,
      decisionsCount: 0,
      tradesCount: 0,
      winRate: 0,
      realizedPnl: 0,
      averageReturn: 0,
      maxDrawdown: 0,
      thesisAccuracy: 0,
      riskViolations: 0,
      timeActiveDays: 1,
    },
  });
  console.log("✅ Data Reputation Metrics diinisialisasi");

  // =========================================================================
  // STEP 4: Treasury ($1,000 USD-SIM)
  // =========================================================================
  const treasury = await prisma.agentTreasury.upsert({
    where: { agentId: agentRecord.id },
    update: {
      initialCapital: 1000,
      currentBalance: 1000,
      currency: "USD-SIM",
    },
    create: {
      agentId: agentRecord.id,
      initialCapital: 1000,
      currentBalance: 1000,
      currency: "USD-SIM",
    },
  });
  console.log(`✅ Treasury diinisialisasi: $${Number(treasury.currentBalance).toFixed(2)} USD-SIM`);

  // =========================================================================
  // STEP 5: Economic Events (Life Log Genesis)
  // =========================================================================
  console.log("\n📜 Mencatat genesis economic events (Life Log)...");

  // Clear existing genesis events
  await prisma.economicEvent.deleteMany({
    where: {
      agentId: agentRecord.id,
      eventType: {
        in: ["AGENT_BORN", "IDENTITY_REGISTERED", "WALLET_CREATED", "TREASURY_FUNDED"],
      },
    },
  });

  const genesisEvents = [
    {
      agentId: agentRecord.id,
      eventType: "AGENT_BORN" as const,
      title: "Glyph Born",
      description: "Glyph agent lahir sebagai entitas ekonomi otonom di Robinhood Chain Testnet.",
      day: 1,
      result: "GENESIS",
    },
    {
      agentId: agentRecord.id,
      eventType: "IDENTITY_REGISTERED" as const,
      title: "ERC-8004 Identity Registered",
      description: `Identitas on-chain resmi terdaftar dengan Agent ID #${agentIdBigInt}.`,
      day: 1,
      txHash: registerTxHash,
    },
    {
      agentId: agentRecord.id,
      eventType: "WALLET_CREATED" as const,
      title: "Smart Account Wallet Created",
      description: `Dompet otonom dibuat di Robinhood Chain Testnet: ${glyphWallet}`,
      day: 1,
      txHash: setWalletTxHash || registerTxHash,
    },
    {
      agentId: agentRecord.id,
      eventType: "TREASURY_FUNDED" as const,
      title: "Treasury Funded",
      description: "Modal simulasi awal $1,000.00 USD-SIM dialokasikan ke pool ekonomi otonom.",
      day: 1,
      result: "+$1,000.00",
    },
  ];

  for (const event of genesisEvents) {
    await prisma.economicEvent.create({ data: event });
    console.log(`  ✅ Event ${event.eventType} dicatat`);
  }

  // Record the registration transaction
  await prisma.transaction.upsert({
    where: { transactionHash: registerTxHash },
    update: {
      contractAddress,
      blockNumber: Number(receipt.blockNumber),
    },
    create: {
      transactionHash: registerTxHash,
      contractAddress,
      blockNumber: Number(receipt.blockNumber),
      eventType: "IDENTITY_REGISTERED",
    },
  });
  console.log(`✅ Transaction record disimpan: ${registerTxHash}`);

  // =========================================================================
  // DONE
  // =========================================================================
  const explorerUrl = `${process.env.BLOCK_EXPLORER_URL || "https://explorer.testnet.chain.robinhood.com"}`;

  console.log("\n🎉 ═══════════════════════════════════════════════════════");
  console.log("   SELURUH PROSES 'GLYPH LAHIR' SUKSES!");
  console.log("   ═══════════════════════════════════════════════════════");
  console.log(`   🆔 Agent ID:    #${agentIdBigInt}`);
  console.log(`   💼 Wallet:      ${glyphWallet}`);
  console.log(`   💰 Treasury:    $1,000.00 USD-SIM`);
  console.log(`   📝 Tx Hash:     ${registerTxHash}`);
  console.log(`   🔗 Explorer:    ${explorerUrl}/tx/${registerTxHash}`);
  console.log("");
  console.log(`   ⚠️  PENTING: Update .env → GLYPH_AGENT_ID=${agentIdBigInt}`);
  console.log("   ═══════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
