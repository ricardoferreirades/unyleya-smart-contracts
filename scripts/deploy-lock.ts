import hre from "hardhat";
import { parseArgs, validateNetwork } from "./deployments/utils";
import { deployLock } from "./deployments/lock";

async function main() {
  // Force contract to Lock for this script
  const args = parseArgs();
  args.contract = "Lock";

  // Validate required parameters
  if (!args.params.unlockTime) {
    console.error("❌ Error: Lock requires --unlock-time parameter");
    console.error("Usage: npm run deploy:lock -- --unlock-time 3600 [--locked-amount \"0.1\"] [--network sepolia]");
    process.exit(1);
  }

  // Validate network configuration
  await validateNetwork(hre);

  // Deploy Lock
  const deployedAddress = await deployLock(hre, args.params);

  console.log(`✅ Deployment completed successfully!`);
  console.log(`📍 Contract address: ${deployedAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

