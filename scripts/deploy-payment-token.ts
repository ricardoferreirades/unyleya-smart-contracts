import hre from "hardhat";
import { parseArgs, validateNetwork } from "./deployments/utils";
import { deployPaymentToken } from "./deployments/paymentToken";

async function main() {
  // Force contract to PaymentToken for this script
  const args = parseArgs();
  args.contract = "PaymentToken";

  // Validate required parameters
  if (!args.params.name || !args.params.symbol) {
    console.error("❌ Error: PaymentToken requires --name and --symbol parameters");
    console.error("Usage: npm run deploy:payment-token -- --name \"Token Name\" --symbol \"SYMBOL\" [--network sepolia]");
    process.exit(1);
  }

  // Validate network configuration
  await validateNetwork(hre);

  // Deploy PaymentToken
  const deployedAddress = await deployPaymentToken(hre, args.params);

  console.log(`✅ Deployment completed successfully!`);
  console.log(`📍 Contract address: ${deployedAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

