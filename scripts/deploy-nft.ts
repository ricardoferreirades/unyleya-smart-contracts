import hre from "hardhat";
import { parseArgs, validateNetwork } from "./deployments/utils";
import { deployNFT } from "./deployments/nft";

async function main() {
  // Force contract to NFT for this script
  const args = parseArgs();
  args.contract = "NFT";

  // Validate required parameters
  if (!args.params.tokenAddress || !args.params.price || !args.params.name || !args.params.symbol) {
    console.error("❌ Error: NFT requires --token-address, --price, --name, and --symbol parameters");
    console.error("Usage: npm run deploy:nft -- --token-address <address> --price \"10\" --name \"NFT Name\" --symbol \"SYMBOL\" [--network sepolia]");
    process.exit(1);
  }

  // Validate network configuration
  await validateNetwork(hre);

  // Deploy NFT
  const deployedAddress = await deployNFT(hre, args.params);

  console.log(`✅ Deployment completed successfully!`);
  console.log(`📍 Contract address: ${deployedAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

