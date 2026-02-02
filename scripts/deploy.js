const hre = require("hardhat");

async function main() {
  // Validate network configuration
  const network = hre.network.name;
  const networkConfig = hre.network.config;
  
  if (network !== "hardhat" && network !== "localhost") {
    if (!networkConfig.url || networkConfig.url === "") {
      throw new Error(
        `❌ Error: ${network.toUpperCase()}_URL is not set in your .env file.\n` +
        `Please add ${network.toUpperCase()}_URL=https://your-rpc-url to your .env file.`
      );
    }
    
    if (!networkConfig.accounts || networkConfig.accounts.length === 0) {
      throw new Error(
        `❌ Error: ${network.toUpperCase()}_PRIVATE_KEY is not set or invalid in your .env file.\n` +
        `Please add a valid private key (64 hex characters) to your .env file.`
      );
    }
    
    console.log(`\n📡 Connecting to ${network} network...`);
    console.log(`🔗 RPC URL: ${networkConfig.url.substring(0, 30)}...`);
    console.log(`👤 Deployer: ${await hre.ethers.getSigners().then(s => s[0].address)}\n`);
  }

  // Deploy PaymentToken
  const TOKEN_NAME = "Payment Token";
  const TOKEN_SYMBOL = "PAY";

  console.log("🚀 Deploying PaymentToken contract...\n");

  const paymentToken = await hre.ethers.deployContract("PaymentToken", [
    TOKEN_NAME,
    TOKEN_SYMBOL,
  ]);

  await paymentToken.waitForDeployment();

  const paymentTokenAddress = await paymentToken.getAddress();
  
  console.log("\n=== PaymentToken Deployment Successful ===");
  console.log(`Contract: PaymentToken`);
  console.log(`Address: ${paymentTokenAddress}`);
  console.log(`Name: ${TOKEN_NAME}`);
  console.log(`Symbol: ${TOKEN_SYMBOL}`);
  console.log(`Decimals: 18`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Owner: ${await paymentToken.owner()}`);
  console.log("==========================================\n");

  // If deployed to a testnet/mainnet, show verification command
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("To verify PaymentToken on Etherscan, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${paymentTokenAddress} "${TOKEN_NAME}" "${TOKEN_SYMBOL}"\n`);
  }

  // Optional: Deploy Lock contract (original contract)
  // Uncomment below if you want to deploy both contracts
  /*
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;
  const lockedAmount = hre.ethers.parseEther("0.001");

  console.log("🚀 Deploying Lock contract...\n");

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
  console.log("==================================\n");
  */
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

