import "dotenv/config";
import "../src/lib/dns-fix";
import {
  createPublicClient,
  createWalletClient,
  http,
  parseAbi,
  defineChain,
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

  const contractAddress = process.env.IDENTITY_REGISTRY_CONTRACT_ADDRESS as `0x${string}`;
  const privateKey = process.env.SMART_ACCOUNT_OWNER_PRIVATE_KEY as `0x${string}`;
  const glyphWallet = process.env.NEXT_PUBLIC_GLYPH_WALLET_ADDRESS as `0x${string}`;
  const agentURI = "/agents/glyph.json";

  if (!contractAddress || !privateKey || !glyphWallet) {
    throw new Error("Mohon lengkapi IDENTITY_REGISTRY_CONTRACT_ADDRESS, SMART_ACCOUNT_OWNER_PRIVATE_KEY, dan NEXT_PUBLIC_GLYPH_WALLET_ADDRESS di .env");
  }

  const account = privateKeyToAccount(privateKey);
  console.log(`👤 Signer Server Address: ${account.address}`);
  console.log(`🏛️  Kontrak IdentityRegistry: ${contractAddress}`);

  const publicClient = createPublicClient({
    chain: robinhoodTestnet,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: robinhoodTestnet,
    transport: http(),
  });

  let agentIdBigInt: bigint = BigInt(1);
  let txHash: string | undefined;

  // Cek apakah agentId 1 sudah pernah di-mint sebelumnya
  try {
    const existingOwner = await publicClient.readContract({
      address: contractAddress,
      abi: identityRegistryAbi,
      functionName: "ownerOf",
      args: [BigInt(1)],
    });
    console.log(`ℹ️  Agent #1 sudah terdaftar on-chain. Pemilik: ${existingOwner}`);
  } catch {
    console.log(`📝 Memanggil register("${agentURI}")...`);
    txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: identityRegistryAbi,
      functionName: "register",
      args: [agentURI],
    });

    console.log(`⏳ Menunggu konfirmasi transaksi: ${txHash}`);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });
    console.log(`✅ Registrasi berhasil di blok: ${receipt.blockNumber}`);
  }

  // Set Agent Wallet on-chain jika belum terhubung
  try {
    const currentWallet = await publicClient.readContract({
      address: contractAddress,
      abi: identityRegistryAbi,
      functionName: "getAgentWallet",
      args: [agentIdBigInt],
    });

    if (currentWallet.toLowerCase() !== glyphWallet.toLowerCase()) {
      console.log(`🔗 Menghubungkan dompet agen ke on-chain: ${glyphWallet}...`);
      const setWalletTx = await walletClient.writeContract({
        address: contractAddress,
        abi: identityRegistryAbi,
        functionName: "setAgentWallet",
        args: [agentIdBigInt, glyphWallet],
      });
      await publicClient.waitForTransactionReceipt({ hash: setWalletTx });
      console.log(`✅ Dompet agen berhasil dihubungkan di on-chain: ${setWalletTx}`);
    } else {
      console.log(`ℹ️  Dompet agen on-chain sudah sesuai: ${currentWallet}`);
    }
  } catch (err: unknown) {
    console.warn("⚠️  Peringatan saat memeriksa wallet on-chain:", err instanceof Error ? err.message : String(err));
  }

  // Simpan ke Database PostgreSQL (Supabase) via Prisma
  console.log("\n💾 Menyimpan data agen dan wallet ke database...");

  const agentRecord = await prisma.agent.upsert({
    where: { agentId: String(agentIdBigInt) },
    update: {
      name: "Glyph",
      status: "ACTIVE",
      metadataUri: agentURI,
    },
    create: {
      agentId: String(agentIdBigInt),
      name: "Glyph",
      status: "ACTIVE",
      metadataUri: agentURI,
    },
  });

  console.log(`✅ Data Agent disimpan (ID DB: ${agentRecord.id}, agentId: ${agentRecord.agentId})`);

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

  // Simpan Default Policy jika belum ada
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

  // Catat Economic Events awal untuk Life Log
  const existingBirthEvent = await prisma.economicEvent.findFirst({
    where: { agentId: agentRecord.id, eventType: "AGENT_BORN" },
  });

  if (!existingBirthEvent) {
    await prisma.economicEvent.create({
      data: {
        agentId: agentRecord.id,
        eventType: "AGENT_BORN",
        title: "Glyph Born",
        description: "Glyph agent lahir sebagai entitas ekonomi otonom di Robinhood Chain Testnet.",
        day: 1,
      },
    });
    console.log("✅ Event AGENT_BORN dicatat di Life Log");
  }

  const existingIdentityEvent = await prisma.economicEvent.findFirst({
    where: { agentId: agentRecord.id, eventType: "IDENTITY_REGISTERED" },
  });

  if (!existingIdentityEvent) {
    await prisma.economicEvent.create({
      data: {
        agentId: agentRecord.id,
        eventType: "IDENTITY_REGISTERED",
        title: "ERC-8004 Identity Registered",
        description: `Identitas on-chain resmi terdaftar dengan Agent ID #${agentIdBigInt}.`,
        day: 1,
        txHash: txHash,
      },
    });
    console.log("✅ Event IDENTITY_REGISTERED dicatat di Life Log");
  }

  console.log("\n🎉 SELURUH PROSES REGISTRASI IDENTITAS & DATABASE SUKSES!");
  console.log(`🔗 Verifikasi di Explorer: https://explorer.testnet.chain.robinhood.com/address/${contractAddress}`);
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
