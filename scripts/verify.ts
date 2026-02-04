import hre from "hardhat";

async function main() {
  // Get contract address and constructor arguments from environment variables or command line
  // Hardhat v2 doesn't allow positional args after --network, so we use env vars
  const contractAddress = process.env.CONTRACT_ADDRESS || process.argv[2];
  const constructorArgsEnv = process.env.CONSTRUCTOR_ARGS 
    ? process.env.CONSTRUCTOR_ARGS.split(',').map(arg => arg.trim())
    : [];
  const constructorArgs = constructorArgsEnv.length > 0 
    ? constructorArgsEnv 
    : process.argv.slice(3);

  if (!contractAddress) {
    console.error("❌ Error: Contract address is required");
    console.log("\nUsage (Method 1 - Environment Variables):");
    console.log("  CONTRACT_ADDRESS=0x... CONSTRUCTOR_ARGS=\"arg1,arg2,arg3\" npx hardhat run scripts/verify.ts --network sepolia");
    console.log("\nUsage (Method 2 - Direct Hardhat Command - Recommended):");
    console.log("  npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <arg1> <arg2> <arg3>");
    console.log("\nExamples:");
    console.log("  # Verify PaymentToken:");
    console.log("  npx hardhat verify --network sepolia 0x... \"Token Name\" \"SYMBOL\"");
    console.log("\n  # Verify NFT:");
    console.log("  npx hardhat verify --network sepolia 0x... \"0xPAYMENT_TOKEN\" \"10000000000000000000\" \"NFT Name\" \"SYMBOL\"");
    console.log("\n  # Verify Lock:");
    console.log("  npx hardhat verify --network sepolia 0x... 1234567890");
    process.exit(1);
  }

  const network = hre.network.name;
  
  if (network === "hardhat" || network === "localhost") {
    console.error("❌ Error: Cannot verify contracts on local networks (hardhat/localhost)");
    console.error("Please deploy to a public testnet (sepolia, goerli, etc.) to verify on Etherscan.");
    process.exit(1);
  }

  console.log(`\n🔍 Verifying contract at ${contractAddress} on ${network}...\n`);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs.length > 0 ? constructorArgs : [],
    });
    
    // Get the explorer URL based on network
    const explorerUrl = getExplorerUrl(network, contractAddress);
    console.log("\n✅ Contract verified successfully!");
    console.log(`\n📍 View on Explorer: ${explorerUrl}\n`);
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified")) {
      const explorerUrl = getExplorerUrl(network, contractAddress);
      console.log("\n✅ Contract is already verified!");
      console.log(`\n📍 View on Explorer: ${explorerUrl}\n`);
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }
}

function getExplorerUrl(network: string, address: string): string {
  const networkMap: { [key: string]: string } = {
    sepolia: "https://sepolia.etherscan.io",
    goerli: "https://goerli.etherscan.io",
    mainnet: "https://etherscan.io",
    polygon: "https://polygonscan.com",
    mumbai: "https://mumbai.polygonscan.com",
  };

  const baseUrl = networkMap[network.toLowerCase()] || `https://${network}.etherscan.io`;
  return `${baseUrl}/address/${address}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

