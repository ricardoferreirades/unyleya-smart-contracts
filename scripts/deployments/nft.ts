import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeploymentParams } from "./types";

export async function deployNFT(
  hre: HardhatRuntimeEnvironment,
  params: DeploymentParams
): Promise<string> {
  if (!params.tokenAddress || !params.price || !params.name || !params.symbol) {
    throw new Error(
      "❌ Error: NFT requires --token-address, --price, --name, and --symbol parameters"
    );
  }

  console.log("🚀 Deploying NFT contract...\n");
  console.log(`Payment Token Address: ${params.tokenAddress}`);
  console.log(`Price: ${params.price} (in payment token units)`);
  console.log(`Name: ${params.name}`);
  console.log(`Symbol: ${params.symbol}\n`);

  // Access ethers through type assertion (Hardhat v2 with @nomicfoundation/hardhat-ethers)
  const ethers = (hre as any).ethers;

  // Parse price - handle both wei and ether format
  let priceInWei: bigint;
  try {
    // Try parsing as ether first (e.g., "10" = 10 tokens)
    priceInWei = ethers.parseEther(params.price);
  } catch {
    // If that fails, try parsing as wei
    priceInWei = BigInt(params.price);
  }

  const nft = await ethers.deployContract("NFT", [
    params.tokenAddress,
    priceInWei,
    params.name,
    params.symbol,
  ]);

  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();

  console.log("\n=== NFT Deployment Successful ===");
  console.log(`Contract: NFT`);
  console.log(`Address: ${nftAddress}`);
  console.log(`Payment Token: ${params.tokenAddress}`);
  console.log(`Price: ${params.price} (${priceInWei.toString()} wei)`);
  console.log(`Name: ${params.name}`);
  console.log(`Symbol: ${params.symbol}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Owner: ${await nft.owner()}`);
  console.log("==================================\n");

  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("To verify NFT on Etherscan, run:");
    console.log(
      `npx hardhat verify --network ${hre.network.name} ${nftAddress} "${params.tokenAddress}" "${priceInWei.toString()}" "${params.name}" "${params.symbol}"\n`
    );
  }

  return nftAddress;
}

