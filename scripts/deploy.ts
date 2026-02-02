import hre from "hardhat";
import { parseArgs, printUsage, validateNetwork } from "./deployments/utils";
import { deployPaymentToken } from "./deployments/paymentToken";
import { deployLock } from "./deployments/lock";
import { deployNFT } from "./deployments/nft";

async function main() {
  const args = parseArgs();

  // Validate contract name
  if (!args.contract) {
    console.error("❌ Error: Contract name is required. Use --contract or -c");
    printUsage();
    process.exit(1);
  }

  const validContracts = ["PaymentToken", "Lock", "NFT"];
  if (!validContracts.includes(args.contract)) {
    console.error(`❌ Error: Invalid contract name "${args.contract}"`);
    console.error(`Available contracts: ${validContracts.join(", ")}`);
    process.exit(1);
  }

  // Validate network configuration
  await validateNetwork(hre);

  // Deploy the requested contract
  let deployedAddress: string;
  try {
    switch (args.contract) {
      case "PaymentToken":
        deployedAddress = await deployPaymentToken(hre, args.params);
        break;
      case "Lock":
        deployedAddress = await deployLock(hre, args.params);
        break;
      case "NFT":
        deployedAddress = await deployNFT(hre, args.params);
        break;
      default:
        throw new Error(`Unsupported contract: ${args.contract}`);
    }
  } catch (error: any) {
    console.error(`\n❌ Deployment failed: ${error.message}`);
    process.exit(1);
  }

  console.log(`✅ Deployment completed successfully!`);
  console.log(`📍 Contract address: ${deployedAddress}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

