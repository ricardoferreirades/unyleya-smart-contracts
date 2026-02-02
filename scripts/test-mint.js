const hre = require("hardhat");

/**
 * Test script to mint and transfer tokens
 * This helps verify the contract works correctly
 * 
 * Usage:
 *   npx hardhat run scripts/test-mint.js --network sepolia
 * 
 * Make sure to set CONTRACT_ADDRESS and RECIPIENT_ADDRESS in .env or update below
 */
async function main() {
  const network = hre.network.name;
  console.log(`\n📡 Network: ${network}\n`);

  // Update these with your addresses
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const RECIPIENT_ADDRESS = process.env.RECIPIENT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const MINT_AMOUNT = process.env.MINT_AMOUNT || "100"; // tokens

  if (CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: Please set CONTRACT_ADDRESS in .env");
    console.error("   Example: CONTRACT_ADDRESS=0x1234... npx hardhat run scripts/test-mint.js --network sepolia");
    process.exit(1);
  }

  if (RECIPIENT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: Please set RECIPIENT_ADDRESS in .env");
    console.error("   Example: RECIPIENT_ADDRESS=0x5678... npx hardhat run scripts/test-mint.js --network sepolia");
    process.exit(1);
  }

  const [owner] = await ethers.getSigners();
  
  console.log("👤 Owner (deployer):", owner.address);
  console.log("📄 Contract:", CONTRACT_ADDRESS);
  console.log("👤 Recipient:", RECIPIENT_ADDRESS);
  console.log("💰 Amount:", MINT_AMOUNT, "tokens");
  console.log("");

  // Attach to deployed contract
  const PaymentToken = await ethers.getContractFactory("PaymentToken");
  const paymentToken = PaymentToken.attach(CONTRACT_ADDRESS);

  try {
    // Verify owner
    const contractOwner = await paymentToken.owner();
    console.log("🔍 Contract Owner:", contractOwner);
    console.log("🔍 Your Address:", owner.address);
    
    if (contractOwner.toLowerCase() !== owner.address.toLowerCase()) {
      console.error("\n❌ ERROR: You are not the contract owner!");
      console.error("   Contract owner:", contractOwner);
      console.error("   Your address:", owner.address);
      console.error("\n   Solution: Use the owner's private key in your .env file");
      process.exit(1);
    }
    console.log("✅ Owner verification passed\n");

    // Check current state
    console.log("📊 Current State:");
    const totalSupplyBefore = await paymentToken.totalSupply();
    const recipientBalanceBefore = await paymentToken.balanceOf(RECIPIENT_ADDRESS);
    console.log("  Total Supply:", ethers.formatEther(totalSupplyBefore), "PAY");
    console.log("  Recipient Balance:", ethers.formatEther(recipientBalanceBefore), "PAY");
    console.log("");

    // Convert amount to wei
    const amount = ethers.parseEther(MINT_AMOUNT);
    console.log(`🚀 Minting and transferring ${MINT_AMOUNT} PAY tokens...`);
    console.log(`   Amount in wei: ${amount.toString()}`);
    console.log("");

    // Execute mintAndTransfer
    const tx = await paymentToken.mintAndTransfer(RECIPIENT_ADDRESS, amount);
    console.log("⏳ Transaction sent!");
    console.log("   Hash:", tx.hash);
    console.log("   Waiting for confirmation...\n");

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("   Block:", receipt.blockNumber);
    console.log("   Gas used:", receipt.gasUsed.toString());
    console.log("");

    // Check events
    console.log("📋 Events:");
    const mintAndTransferEvents = receipt.logs
      .filter(log => {
        try {
          const parsed = paymentToken.interface.parseLog(log);
          return parsed && parsed.name === "MintAndTransfer";
        } catch {
          return false;
        }
      })
      .map(log => paymentToken.interface.parseLog(log));

    if (mintAndTransferEvents.length > 0) {
      const event = mintAndTransferEvents[0];
      console.log("  ✅ MintAndTransfer event emitted:");
      console.log("     From:", event.args.from);
      console.log("     To:", event.args.to);
      console.log("     Amount:", ethers.formatEther(event.args.amount), "PAY");
    } else {
      console.log("  ⚠️  No MintAndTransfer event found (check Transfer events)");
    }
    console.log("");

    // Check final state
    console.log("📊 Final State:");
    const totalSupplyAfter = await paymentToken.totalSupply();
    const recipientBalanceAfter = await paymentToken.balanceOf(RECIPIENT_ADDRESS);
    console.log("  Total Supply:", ethers.formatEther(totalSupplyAfter), "PAY");
    console.log("  Recipient Balance:", ethers.formatEther(recipientBalanceAfter), "PAY");
    console.log("");

    // Verify changes
    const expectedSupply = totalSupplyBefore + amount;
    const expectedBalance = recipientBalanceBefore + amount;

    if (totalSupplyAfter === expectedSupply && recipientBalanceAfter === expectedBalance) {
      console.log("✅ All checks passed! Tokens successfully minted and transferred.");
    } else {
      console.error("❌ State mismatch!");
      console.error("   Expected supply:", ethers.formatEther(expectedSupply));
      console.error("   Actual supply:", ethers.formatEther(totalSupplyAfter));
      console.error("   Expected balance:", ethers.formatEther(expectedBalance));
      console.error("   Actual balance:", ethers.formatEther(recipientBalanceAfter));
    }

    console.log("\n🔗 View on Etherscan:");
    console.log(`   Transaction: https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log(`   Contract: https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);

  } catch (error) {
    console.error("\n❌ Error occurred:");
    console.error("   Message:", error.message);
    
    if (error.message.includes("OwnableUnauthorizedAccount")) {
      console.error("\n   💡 Solution: Make sure you're using the owner's private key");
    } else if (error.message.includes("insufficient funds")) {
      console.error("\n   💡 Solution: Get more Sepolia ETH from a faucet");
    } else if (error.message.includes("zero address")) {
      console.error("\n   💡 Solution: Use a valid recipient address");
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

