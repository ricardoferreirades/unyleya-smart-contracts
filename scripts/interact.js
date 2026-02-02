const hre = require("hardhat");

/**
 * Interaction script for PaymentToken contract
 * 
 * Usage:
 *   npx hardhat run scripts/interact.js --network sepolia
 * 
 * Make sure to set CONTRACT_ADDRESS environment variable or update it below
 */
async function main() {
  const network = hre.network.name;
  console.log(`\n📡 Network: ${network}\n`);

  // Update this with your deployed contract address
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: Please set CONTRACT_ADDRESS in .env or update the script");
    console.error("   Example: CONTRACT_ADDRESS=0x1234... npx hardhat run scripts/interact.js --network sepolia");
    process.exit(1);
  }

  const [owner, recipient, otherAccount] = await ethers.getSigners();
  
  console.log("👤 Owner:", owner.address);
  console.log("👤 Recipient:", recipient.address);
  console.log("📄 Contract:", CONTRACT_ADDRESS);
  console.log("");

  // Attach to deployed contract
  const PaymentToken = await ethers.getContractFactory("PaymentToken");
  const paymentToken = PaymentToken.attach(CONTRACT_ADDRESS);

  try {
    // Read contract info
    console.log("📊 Contract Information:");
    console.log("  Name:", await paymentToken.name());
    console.log("  Symbol:", await paymentToken.symbol());
    console.log("  Decimals:", await paymentToken.decimals());
    console.log("  Total Supply:", ethers.formatEther(await paymentToken.totalSupply()), "PAY");
    console.log("  Owner:", await paymentToken.owner());
    console.log("");

    // Check balances
    console.log("💰 Balances:");
    const ownerBalance = await paymentToken.balanceOf(owner.address);
    const recipientBalance = await paymentToken.balanceOf(recipient.address);
    console.log("  Owner:", ethers.formatEther(ownerBalance), "PAY");
    console.log("  Recipient:", ethers.formatEther(recipientBalance), "PAY");
    console.log("");

    // Example: Mint and transfer tokens (only if owner)
    if (owner.address.toLowerCase() === (await paymentToken.owner()).toLowerCase()) {
      console.log("🚀 Example: Mint and Transfer");
      console.log("  To mint and transfer tokens, uncomment the code below:");
      console.log("");
      console.log("  const amount = ethers.parseEther('100');");
      console.log("  const tx = await paymentToken.mintAndTransfer(recipient.address, amount);");
      console.log("  await tx.wait();");
      console.log("  console.log('✅ Tokens minted and transferred!');");
      console.log("");

      // Uncomment to actually execute:
      /*
      const amount = ethers.parseEther("100");
      console.log(`  Minting and transferring ${ethers.formatEther(amount)} PAY to ${recipient.address}...`);
      const tx = await paymentToken.mintAndTransfer(recipient.address, amount);
      console.log("  Transaction hash:", tx.hash);
      await tx.wait();
      console.log("  ✅ Tokens minted and transferred!");
      
      // Check new balances
      const newRecipientBalance = await paymentToken.balanceOf(recipient.address);
      console.log("  New recipient balance:", ethers.formatEther(newRecipientBalance), "PAY");
      */
    } else {
      console.log("⚠️  Current signer is not the owner. Cannot mint tokens.");
      console.log("  Owner address:", await paymentToken.owner());
      console.log("  Current signer:", owner.address);
    }

    console.log("\n✅ Interaction complete!");
    console.log("\n💡 Tip: Use Etherscan to interact with the contract via MetaMask:");
    console.log(`   https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}#writeContract`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("contract")) {
      console.error("   Make sure the contract address is correct and deployed on this network");
    }
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

