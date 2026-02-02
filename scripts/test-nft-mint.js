const hre = require("hardhat");

/**
 * Test script to mint NFTs
 * This helps verify the NFT contract works correctly
 * 
 * Usage:
 *   npx hardhat run scripts/test-nft-mint.js --network sepolia
 * 
 * Make sure to set NFT_CONTRACT_ADDRESS and PAYMENT_TOKEN_ADDRESS in .env
 */
async function main() {
  const network = hre.network.name;
  console.log(`\n📡 Network: ${network}\n`);

  // Update these with your addresses
  const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const PAYMENT_TOKEN_ADDRESS = process.env.PAYMENT_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  const MINT_TO_ADDRESS = process.env.MINT_TO_ADDRESS || null; // If null, mints to caller

  if (NFT_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: Please set NFT_CONTRACT_ADDRESS in .env");
    console.error("   Example: NFT_CONTRACT_ADDRESS=0x1234... npx hardhat run scripts/test-nft-mint.js --network sepolia");
    process.exit(1);
  }

  if (PAYMENT_TOKEN_ADDRESS === "0x0000000000000000000000000000000000000000") {
    console.error("❌ Error: Please set PAYMENT_TOKEN_ADDRESS in .env");
    console.error("   Example: PAYMENT_TOKEN_ADDRESS=0x5678... npx hardhat run scripts/test-nft-mint.js --network sepolia");
    process.exit(1);
  }

  const [minter] = await ethers.getSigners();
  const recipientAddress = MINT_TO_ADDRESS || minter.address;
  
  console.log("👤 Minter (caller):", minter.address);
  console.log("📄 NFT Contract:", NFT_CONTRACT_ADDRESS);
  console.log("💰 Payment Token:", PAYMENT_TOKEN_ADDRESS);
  console.log("🎯 Mint to:", recipientAddress);
  console.log("");

  // Attach to contracts
  const NFT = await ethers.getContractFactory("NFT");
  const nft = NFT.attach(NFT_CONTRACT_ADDRESS);

  const PaymentToken = await ethers.getContractFactory("PaymentToken");
  const paymentToken = PaymentToken.attach(PAYMENT_TOKEN_ADDRESS);

  try {
    // Get contract info
    const nftPrice = await nft.price();
    const nftName = await nft.name();
    const nftSymbol = await nft.symbol();
    const nftOwner = await nft.owner();
    const nextTokenId = await nft.nextTokenId();
    const totalSupply = await nft.totalSupply();

    console.log("📊 NFT Contract Info:");
    console.log("  Name:", nftName);
    console.log("  Symbol:", nftSymbol);
    console.log("  Owner:", nftOwner);
    console.log("  Price:", ethers.formatEther(nftPrice), "PAY");
    console.log("  Next Token ID:", nextTokenId.toString());
    console.log("  Total Supply:", totalSupply.toString());
    console.log("");

    // Check minter's balance
    const minterBalance = await paymentToken.balanceOf(minter.address);
    console.log("💰 Minter's PAY Token Balance:", ethers.formatEther(minterBalance), "PAY");
    console.log("");

    if (minterBalance < nftPrice) {
      console.error("❌ ERROR: Insufficient PAY token balance!");
      console.error("   Required:", ethers.formatEther(nftPrice), "PAY");
      console.error("   Available:", ethers.formatEther(minterBalance), "PAY");
      console.error("\n   Solution: Get more PAY tokens or mint them first");
      process.exit(1);
    }

    // Check allowance
    const currentAllowance = await paymentToken.allowance(minter.address, NFT_CONTRACT_ADDRESS);
    console.log("🔐 Current Allowance:", ethers.formatEther(currentAllowance), "PAY");

    if (currentAllowance < nftPrice) {
      console.log("⚠️  Insufficient allowance. Approving tokens...");
      const approveTx = await paymentToken.approve(NFT_CONTRACT_ADDRESS, nftPrice);
      console.log("   Transaction hash:", approveTx.hash);
      await approveTx.wait();
      console.log("✅ Approval confirmed!");
      console.log("");
    } else {
      console.log("✅ Sufficient allowance already set");
      console.log("");
    }

    // Check current state
    console.log("📊 State Before Mint:");
    const recipientBalanceBefore = await nft.balanceOf(recipientAddress);
    console.log("  Recipient NFT Balance:", recipientBalanceBefore.toString());
    console.log("");

    // Mint NFT
    console.log(`🚀 Minting NFT to ${recipientAddress}...`);
    const mintFunction = recipientAddress === minter.address 
      ? nft.mint() 
      : nft.mintTo(recipientAddress);
    
    const tx = await mintFunction;
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
    const mintedEvents = receipt.logs
      .filter(log => {
        try {
          const parsed = nft.interface.parseLog(log);
          return parsed && parsed.name === "Minted";
        } catch {
          return false;
        }
      })
      .map(log => nft.interface.parseLog(log));

    if (mintedEvents.length > 0) {
      const event = mintedEvents[0];
      console.log("  ✅ Minted event emitted:");
      console.log("     To:", event.args.to);
      console.log("     Token ID:", event.args.tokenId.toString());
      console.log("     Price Paid:", ethers.formatEther(event.args.pricePaid), "PAY");
    }

    const transferEvents = receipt.logs
      .filter(log => {
        try {
          const parsed = nft.interface.parseLog(log);
          return parsed && parsed.name === "Transfer";
        } catch {
          return false;
        }
      })
      .map(log => nft.interface.parseLog(log));

    if (transferEvents.length > 0) {
      const event = transferEvents[transferEvents.length - 1]; // Get the last transfer (mint)
      console.log("  ✅ Transfer event emitted:");
      console.log("     From:", event.args.from);
      console.log("     To:", event.args.to);
      console.log("     Token ID:", event.args.tokenId.toString());
    }
    console.log("");

    // Check final state
    console.log("📊 State After Mint:");
    const recipientBalanceAfter = await nft.balanceOf(recipientAddress);
    const newTotalSupply = await nft.totalSupply();
    const newNextTokenId = await nft.nextTokenId();
    const tokenOwner = await nft.ownerOf(nextTokenId);
    console.log("  Recipient NFT Balance:", recipientBalanceAfter.toString());
    console.log("  Total Supply:", newTotalSupply.toString());
    console.log("  Next Token ID:", newNextTokenId.toString());
    console.log("  Token #" + nextTokenId + " Owner:", tokenOwner);
    console.log("");

    // Verify changes
    if (recipientBalanceAfter === recipientBalanceBefore + 1n && tokenOwner.toLowerCase() === recipientAddress.toLowerCase()) {
      console.log("✅ All checks passed! NFT successfully minted.");
    } else {
      console.error("❌ State mismatch!");
      console.error("   Expected balance:", (recipientBalanceBefore + 1n).toString());
      console.error("   Actual balance:", recipientBalanceAfter.toString());
      console.error("   Expected owner:", recipientAddress);
      console.error("   Actual owner:", tokenOwner);
    }

    // Get token URI if set
    try {
      const tokenURI = await nft.tokenURI(nextTokenId);
      if (tokenURI) {
        console.log("  Token URI:", tokenURI);
      }
    } catch {
      // Token URI not set, that's okay
    }

    console.log("\n🔗 View on Etherscan:");
    if (network === "sepolia") {
      console.log(`   Transaction: https://sepolia.etherscan.io/tx/${tx.hash}`);
      console.log(`   NFT Contract: https://sepolia.etherscan.io/address/${NFT_CONTRACT_ADDRESS}`);
      console.log(`   Payment Token: https://sepolia.etherscan.io/address/${PAYMENT_TOKEN_ADDRESS}`);
    }

  } catch (error) {
    console.error("\n❌ Error occurred:");
    console.error("   Message:", error.message);
    
    if (error.message.includes("ERC20InsufficientBalance")) {
      console.error("\n   💡 Solution: Get more PAY tokens or mint them first");
    } else if (error.message.includes("ERC20InsufficientAllowance")) {
      console.error("\n   💡 Solution: Approve the NFT contract to spend your PAY tokens");
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

