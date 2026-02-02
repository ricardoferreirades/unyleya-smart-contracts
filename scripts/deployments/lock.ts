import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeploymentParams } from "./types";

export async function deployLock(
  hre: HardhatRuntimeEnvironment,
  params: DeploymentParams
): Promise<string> {
  if (!params.unlockTime) {
    throw new Error("❌ Error: Lock requires --unlock-time parameter");
  }

  // If unlockTime is less than current timestamp, treat it as relative seconds
  const currentTimestamp = Math.round(Date.now() / 1000);
  let unlockTime = params.unlockTime;
  
  if (unlockTime < currentTimestamp) {
    // Treat as relative seconds from now
    unlockTime = currentTimestamp + unlockTime;
    console.log(`⚠️  Unlock time provided is in the past. Treating as relative seconds.`);
  }

  if (unlockTime <= currentTimestamp) {
    throw new Error("❌ Error: Unlock time must be in the future");
  }

  const lockedAmount = params.lockedAmount 
    ? hre.ethers.parseEther(params.lockedAmount)
    : hre.ethers.parseEther("0.001");

  console.log("🚀 Deploying Lock contract...\n");
  console.log(`Unlock Time: ${new Date(unlockTime * 1000).toISOString()}`);
  console.log(`Unlock Timestamp: ${unlockTime}`);
  console.log(`Locked Amount: ${hre.ethers.formatEther(lockedAmount)} ETH\n`);

  const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
    value: lockedAmount,
  });

  await lock.waitForDeployment();
  const lockAddress = await lock.getAddress();
  
  console.log("\n=== Lock Deployment Successful ===");
  console.log(`Contract: Lock`);
  console.log(`Address: ${lockAddress}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Locked Amount: ${hre.ethers.formatEther(lockedAmount)} ETH`);
  console.log(`Unlock Timestamp: ${unlockTime}`);
  console.log(`Unlock Date: ${new Date(unlockTime * 1000).toISOString()}`);
  console.log("==================================\n");

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("To verify Lock on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${lockAddress} ${unlockTime}\n`);
  }

  return lockAddress;
}

