import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeploymentParams } from "./types";

export async function deployPaymentToken(
  hre: HardhatRuntimeEnvironment,
  params: DeploymentParams
): Promise<string> {
  if (!params.name || !params.symbol) {
    throw new Error("❌ Error: PaymentToken requires --name and --symbol parameters");
  }

  console.log("🚀 Deploying PaymentToken contract...\n");
  console.log(`Name: ${params.name}`);
  console.log(`Symbol: ${params.symbol}\n`);

  // Access ethers through type assertion (Hardhat v2 with @nomicfoundation/hardhat-ethers)
  const ethers = (hre as any).ethers;

  const paymentToken = await ethers.deployContract("PaymentToken", [
    params.name,
    params.symbol,
  ]);

  await paymentToken.waitForDeployment();
  const paymentTokenAddress = await paymentToken.getAddress();
  
  console.log("\n=== PaymentToken Deployment Successful ===");
  console.log(`Contract: PaymentToken`);
  console.log(`Address: ${paymentTokenAddress}`);
  console.log(`Name: ${params.name}`);
  console.log(`Symbol: ${params.symbol}`);
  console.log(`Decimals: 18`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Owner: ${await paymentToken.owner()}`);
  console.log("==========================================\n");

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("To verify PaymentToken on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${paymentTokenAddress} "${params.name}" "${params.symbol}"\n`);
  }

  return paymentTokenAddress;
}

