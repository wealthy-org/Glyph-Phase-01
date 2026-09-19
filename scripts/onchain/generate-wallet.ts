import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

console.log("\n🔑 NEW GLYPH WALLET GENERATED");
console.log("═══════════════════════════════════════════════════════");
console.log(`   Private Key: ${privateKey}`);
console.log(`   Address:     ${account.address}`);
console.log("═══════════════════════════════════════════════════════");
console.log("\n📝 Copy these values to .env:");
console.log(`   SMART_ACCOUNT_OWNER_PRIVATE_KEY=${privateKey}`);
console.log(`   NEXT_PUBLIC_GLYPH_WALLET_ADDRESS=${account.address}`);
console.log("");
