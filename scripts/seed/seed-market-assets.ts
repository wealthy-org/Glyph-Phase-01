import { prisma } from "../../src/lib/prisma";

const INITIAL_ASSETS = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    assetType: "EQUITY",
    isActive: true,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    assetType: "EQUITY",
    isActive: true,
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    assetType: "EQUITY",
    isActive: true,
  },
];

async function main() {
  console.log("Seeding / updating whitelisted market assets (NVDA, MSFT, AAPL)...");

  for (const asset of INITIAL_ASSETS) {
    const record = await prisma.marketAsset.upsert({
      where: { symbol: asset.symbol },
      update: {
        name: asset.name,
        assetType: asset.assetType,
        isActive: asset.isActive,
      },
      create: {
        symbol: asset.symbol,
        name: asset.name,
        assetType: asset.assetType,
        isActive: asset.isActive,
      },
    });
    console.log(`  ✅ Market Asset [${record.symbol}]: ${record.name} (${record.assetType})`);
  }

  const all = await prisma.marketAsset.findMany();
  console.log(`\nTotal Active Market Assets in DB: ${all.length}`);
}

main()
  .catch((err) => {
    console.error("Error seeding market assets:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
