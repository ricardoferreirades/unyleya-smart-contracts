const hre = require("hardhat");

async function main() {
  // Get contract address and constructor arguments from command line
  const contractAddress = process.argv[2];
  const constructorArgs = process.argv.slice(3);

  if (!contractAddress) {
    console.error("Error: Contract address is required");
    console.log("Usage: npx hardhat run scripts/verify.js --network <network> <CONTRACT_ADDRESS> [constructor args...]");
    process.exit(1);
  }

  console.log(`\nVerifying contract at ${contractAddress} on ${hre.network.name}...\n`);

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs.length > 0 ? constructorArgs : [],
    });
    console.log("\n✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("\n✅ Contract is already verified!");
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

