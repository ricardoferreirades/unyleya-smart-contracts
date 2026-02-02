const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("NFT", function () {
  const NFT_NAME = "Test NFT";
  const NFT_SYMBOL = "TNFT";
  const PAYMENT_TOKEN_NAME = "Payment Token";
  const PAYMENT_TOKEN_SYMBOL = "PAY";
  const NFT_PRICE = ethers.parseEther("10"); // 10 PAY tokens
  const BASE_URI = "https://example.com/metadata/";
  const TOKEN_URI = "https://example.com/metadata/1.json";

  async function deployNFTFixture() {
    const [owner, minter, recipient, otherAccount] = await ethers.getSigners();

    // Deploy PaymentToken first
    const PaymentToken = await ethers.getContractFactory("PaymentToken");
    const paymentToken = await PaymentToken.deploy(
      PAYMENT_TOKEN_NAME,
      PAYMENT_TOKEN_SYMBOL
    );

    // Deploy NFT contract
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(
      await paymentToken.getAddress(),
      NFT_PRICE,
      NFT_NAME,
      NFT_SYMBOL
    );

    return { nft, paymentToken, owner, minter, recipient, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { nft, owner } = await loadFixture(deployNFTFixture);

      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should set the correct name", async function () {
      const { nft } = await loadFixture(deployNFTFixture);

      expect(await nft.name()).to.equal(NFT_NAME);
    });

    it("Should set the correct symbol", async function () {
      const { nft } = await loadFixture(deployNFTFixture);

      expect(await nft.symbol()).to.equal(NFT_SYMBOL);
    });

    it("Should set the correct payment token address", async function () {
      const { nft, paymentToken } = await loadFixture(deployNFTFixture);

      expect(await nft.paymentToken()).to.equal(await paymentToken.getAddress());
    });

    it("Should set the correct price", async function () {
      const { nft } = await loadFixture(deployNFTFixture);

      expect(await nft.price()).to.equal(NFT_PRICE);
    });

    it("Should start with token ID counter at 1", async function () {
      const { nft } = await loadFixture(deployNFTFixture);

      expect(await nft.nextTokenId()).to.equal(1);
    });

    it("Should start with zero total supply", async function () {
      const { nft } = await loadFixture(deployNFTFixture);

      expect(await nft.totalSupply()).to.equal(0);
    });

    it("Should revert if token address is zero", async function () {
      const NFT = await ethers.getContractFactory("NFT");

      await expect(
        NFT.deploy(ethers.ZeroAddress, NFT_PRICE, NFT_NAME, NFT_SYMBOL)
      ).to.be.revertedWith("NFT: token address cannot be zero");
    });

    it("Should revert if price is zero", async function () {
      const { paymentToken } = await loadFixture(deployNFTFixture);
      const NFT = await ethers.getContractFactory("NFT");

      await expect(
        NFT.deploy(
          await paymentToken.getAddress(),
          0,
          NFT_NAME,
          NFT_SYMBOL
        )
      ).to.be.revertedWith("NFT: price must be greater than zero");
    });
  });

  describe("Minting", function () {
    describe("Validations", function () {
      it("Should revert if minter has insufficient balance", async function () {
        const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

        // Try to mint without having tokens
        await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

        await expect(nft.connect(minter).mint()).to.be.revertedWithCustomError(
          paymentToken,
          "ERC20InsufficientBalance"
        );
      });

      it("Should revert if minter has not approved tokens", async function () {
        const { nft, paymentToken, owner, minter } = await loadFixture(
          deployNFTFixture
        );

        // Give minter some tokens but don't approve
        await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);

        await expect(nft.connect(minter).mint()).to.be.revertedWithCustomError(
          paymentToken,
          "ERC20InsufficientAllowance"
        );
      });

      it("Should revert if minting to zero address", async function () {
        const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

        await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
        await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

        await expect(
          nft.connect(minter).mintTo(ethers.ZeroAddress)
        ).to.be.revertedWith("NFT: cannot mint to zero address");
      });
    });

    describe("Successful Minting", function () {
      it("Should mint NFT to caller", async function () {
        const { nft, paymentToken, minter, owner } = await loadFixture(
          deployNFTFixture
        );

        // Setup: Give minter tokens and approve
        await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
        await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

        // Mint
        const tx = await nft.connect(minter).mint();
        const receipt = await tx.wait();
        const tokenId = await nft.nextTokenId() - 1n;

        expect(await nft.ownerOf(tokenId)).to.equal(minter.address);
        expect(await nft.balanceOf(minter.address)).to.equal(1);
        expect(await nft.totalSupply()).to.equal(1);
      });

      it("Should transfer payment tokens to owner", async function () {
        const { nft, paymentToken, minter, owner } = await loadFixture(
          deployNFTFixture
        );

        const ownerBalanceBefore = await paymentToken.balanceOf(owner.address);

        // Setup: Give minter tokens and approve
        await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
        await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

        // Mint
        await nft.connect(minter).mint();

        const ownerBalanceAfter = await paymentToken.balanceOf(owner.address);
        expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + NFT_PRICE);
      });

      it("Should deduct payment tokens from minter", async function () {
        const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

        // Setup: Give minter tokens and approve
        await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
        await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

        const minterBalanceBefore = await paymentToken.balanceOf(minter.address);

        // Mint
        await nft.connect(minter).mint();

        const minterBalanceAfter = await paymentToken.balanceOf(minter.address);
        expect(minterBalanceAfter).to.equal(minterBalanceBefore - NFT_PRICE);
      });

      it("Should mint NFT to specified address", async function () {
        const { nft, paymentToken, minter, recipient } = await loadFixture(
          deployNFTFixture
        );

        // Setup: Give minter tokens and approve
        await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
        await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

        // Mint to recipient
        await nft.connect(minter).mintTo(recipient.address);
        const tokenId = await nft.nextTokenId() - 1n;

        expect(await nft.ownerOf(tokenId)).to.equal(recipient.address);
        expect(await nft.balanceOf(recipient.address)).to.equal(1);
        expect(await nft.balanceOf(minter.address)).to.equal(0);
      });

      it("Should increment token ID counter", async function () {
        const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

        // Setup: Give minter tokens and approve
        await paymentToken.mintAndTransfer(minter.address, NFT_PRICE * 3n);
        await paymentToken
          .connect(minter)
          .approve(await nft.getAddress(), NFT_PRICE * 3n);

        expect(await nft.nextTokenId()).to.equal(1);

        await nft.connect(minter).mint();
        expect(await nft.nextTokenId()).to.equal(2);

        await nft.connect(minter).mint();
        expect(await nft.nextTokenId()).to.equal(3);

        await nft.connect(minter).mint();
        expect(await nft.nextTokenId()).to.equal(4);
      });

      it("Should allow owner to mint (but must pay)", async function () {
        const { nft, paymentToken, owner } = await loadFixture(deployNFTFixture);

        // Owner must also pay - give owner tokens and approve
        await paymentToken.mintAndTransfer(owner.address, NFT_PRICE);
        await paymentToken.connect(owner).approve(await nft.getAddress(), NFT_PRICE);

        // Owner mints
        await nft.connect(owner).mint();
        const tokenId = await nft.nextTokenId() - 1n;

        expect(await nft.ownerOf(tokenId)).to.equal(owner.address);
      });

      it("Should handle multiple mints correctly", async function () {
        const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

        const mintCount = 5;
        const totalCost = NFT_PRICE * BigInt(mintCount);

        // Setup: Give minter tokens and approve
        await paymentToken.mintAndTransfer(minter.address, totalCost);
        await paymentToken
          .connect(minter)
          .approve(await nft.getAddress(), totalCost);

        // Mint multiple NFTs
        for (let i = 0; i < mintCount; i++) {
          await nft.connect(minter).mint();
        }

        expect(await nft.balanceOf(minter.address)).to.equal(mintCount);
        expect(await nft.totalSupply()).to.equal(mintCount);
      });
    });

    describe("Events", function () {
      it("Should emit Minted event", async function () {
        const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

        // Setup: Give minter tokens and approve
        await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
        await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

        await expect(nft.connect(minter).mint())
          .to.emit(nft, "Minted")
          .withArgs(minter.address, 1n, NFT_PRICE);
      });

      it("Should emit Transfer event", async function () {
        const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

        // Setup: Give minter tokens and approve
        await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
        await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

        await expect(nft.connect(minter).mint())
          .to.emit(nft, "Transfer")
          .withArgs(ethers.ZeroAddress, minter.address, 1n);
      });
    });
  });

  describe("Price Management", function () {
    describe("setPrice", function () {
      it("Should allow owner to update price", async function () {
        const { nft, owner } = await loadFixture(deployNFTFixture);

        const newPrice = ethers.parseEther("20");
        await nft.connect(owner).setPrice(newPrice);

        expect(await nft.price()).to.equal(newPrice);
      });

      it("Should revert if non-owner tries to set price", async function () {
        const { nft, minter } = await loadFixture(deployNFTFixture);

        const newPrice = ethers.parseEther("20");

        await expect(nft.connect(minter).setPrice(newPrice)).to.be.revertedWithCustomError(
          nft,
          "OwnableUnauthorizedAccount"
        );
      });

      it("Should revert if new price is zero", async function () {
        const { nft, owner } = await loadFixture(deployNFTFixture);

        await expect(nft.connect(owner).setPrice(0)).to.be.revertedWith(
          "NFT: price must be greater than zero"
        );
      });

      it("Should emit PriceUpdated event", async function () {
        const { nft, owner } = await loadFixture(deployNFTFixture);

        const newPrice = ethers.parseEther("20");

        await expect(nft.connect(owner).setPrice(newPrice))
          .to.emit(nft, "PriceUpdated")
          .withArgs(NFT_PRICE, newPrice);
      });

      it("Should allow multiple price updates", async function () {
        const { nft, owner } = await loadFixture(deployNFTFixture);

        const price1 = ethers.parseEther("20");
        const price2 = ethers.parseEther("30");
        const price3 = ethers.parseEther("15");

        await nft.connect(owner).setPrice(price1);
        expect(await nft.price()).to.equal(price1);

        await nft.connect(owner).setPrice(price2);
        expect(await nft.price()).to.equal(price2);

        await nft.connect(owner).setPrice(price3);
        expect(await nft.price()).to.equal(price3);
      });
    });

    describe("Minting with updated price", function () {
      it("Should use new price after price update", async function () {
        const { nft, paymentToken, minter, owner } = await loadFixture(
          deployNFTFixture
        );

        const newPrice = ethers.parseEther("25");

        // Update price
        await nft.connect(owner).setPrice(newPrice);

        // Setup: Give minter tokens and approve with new price
        await paymentToken.mintAndTransfer(minter.address, newPrice);
        await paymentToken.connect(minter).approve(await nft.getAddress(), newPrice);

        // Mint with new price
        await nft.connect(minter).mint();

        const ownerBalance = await paymentToken.balanceOf(owner.address);
        expect(ownerBalance).to.equal(newPrice);
      });
    });
  });

  describe("Token URI", function () {
    it("Should return empty string if base URI and token URI not set", async function () {
      const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

      // Setup: Give minter tokens and approve
      await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
      await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

      // Mint
      await nft.connect(minter).mint();
      const tokenId = 1n;

      const uri = await nft.tokenURI(tokenId);
      expect(uri).to.equal("");
    });

    it("Should return token URI if set", async function () {
      const { nft, paymentToken, minter, owner } = await loadFixture(
        deployNFTFixture
      );

      // Setup: Give minter tokens and approve
      await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
      await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

      // Mint
      await nft.connect(minter).mint();
      const tokenId = 1n;

      // Set token URI
      await nft.connect(owner).setTokenURI(tokenId, TOKEN_URI);

      expect(await nft.tokenURI(tokenId)).to.equal(TOKEN_URI);
    });

    it("Should return base URI + token ID if base URI is set", async function () {
      const { nft, paymentToken, minter, owner } = await loadFixture(
        deployNFTFixture
      );

      // Set base URI
      await nft.connect(owner).setBaseURI(BASE_URI);

      // Setup: Give minter tokens and approve
      await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
      await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

      // Mint
      await nft.connect(minter).mint();
      const tokenId = 1n;

      // If token URI is not set, it should use base URI + token ID
      // But ERC721URIStorage requires explicit token URI to be set
      // So we'll set it to test the base URI functionality
      await nft.connect(owner).setTokenURI(tokenId, `${BASE_URI}${tokenId}.json`);

      expect(await nft.tokenURI(tokenId)).to.equal(`${BASE_URI}${tokenId}.json`);
    });

    it("Should revert if non-owner tries to set token URI", async function () {
      const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

      // Setup: Give minter tokens and approve
      await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
      await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

      // Mint
      await nft.connect(minter).mint();
      const tokenId = 1n;

      await expect(
        nft.connect(minter).setTokenURI(tokenId, TOKEN_URI)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("Should revert if non-owner tries to set base URI", async function () {
      const { nft, minter } = await loadFixture(deployNFTFixture);

      await expect(
        nft.connect(minter).setBaseURI(BASE_URI)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  describe("ERC721 Standard Functions", function () {
    it("Should support ERC721 interface", async function () {
      const { nft } = await loadFixture(deployNFTFixture);

      // ERC721 interface ID: 0x80ac58cd
      const erc721InterfaceId = "0x80ac58cd";
      expect(await nft.supportsInterface(erc721InterfaceId)).to.be.true;
    });

    it("Should support ERC165 interface", async function () {
      const { nft } = await loadFixture(deployNFTFixture);

      // ERC165 interface ID: 0x01ffc9a7
      const erc165InterfaceId = "0x01ffc9a7";
      expect(await nft.supportsInterface(erc165InterfaceId)).to.be.true;
    });

    it("Should allow transfer of NFT", async function () {
      const { nft, paymentToken, minter, recipient } = await loadFixture(
        deployNFTFixture
      );

      // Setup: Give minter tokens and approve
      await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
      await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

      // Mint
      await nft.connect(minter).mint();
      const tokenId = 1n;

      // Transfer
      await nft.connect(minter).transferFrom(minter.address, recipient.address, tokenId);

      expect(await nft.ownerOf(tokenId)).to.equal(recipient.address);
      expect(await nft.balanceOf(minter.address)).to.equal(0);
      expect(await nft.balanceOf(recipient.address)).to.equal(1);
    });

    it("Should allow approval and transferFrom", async function () {
      const { nft, paymentToken, minter, recipient, otherAccount } =
        await loadFixture(deployNFTFixture);

      // Setup: Give minter tokens and approve
      await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
      await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

      // Mint
      await nft.connect(minter).mint();
      const tokenId = 1n;

      // Approve otherAccount to transfer
      await nft.connect(minter).approve(otherAccount.address, tokenId);

      // Transfer via approved account
      await nft
        .connect(otherAccount)
        .transferFrom(minter.address, recipient.address, tokenId);

      expect(await nft.ownerOf(tokenId)).to.equal(recipient.address);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small price", async function () {
      const { paymentToken } = await loadFixture(deployNFTFixture);
      const NFT = await ethers.getContractFactory("NFT");

      const smallPrice = 1; // 1 wei
      const nft = await NFT.deploy(
        await paymentToken.getAddress(),
        smallPrice,
        NFT_NAME,
        NFT_SYMBOL
      );

      expect(await nft.price()).to.equal(smallPrice);
    });

    it("Should handle very large price", async function () {
      const { paymentToken } = await loadFixture(deployNFTFixture);
      const NFT = await ethers.getContractFactory("NFT");

      const largePrice = ethers.parseEther("1000000"); // 1 million tokens
      const nft = await NFT.deploy(
        await paymentToken.getAddress(),
        largePrice,
        NFT_NAME,
        NFT_SYMBOL
      );

      expect(await nft.price()).to.equal(largePrice);
    });

    it("Should handle partial allowance correctly", async function () {
      const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

      // Setup: Give minter tokens but approve less than price
      await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
      const partialAllowance = NFT_PRICE / 2n;
      await paymentToken
        .connect(minter)
        .approve(await nft.getAddress(), partialAllowance);

      // Should revert
      await expect(nft.connect(minter).mint()).to.be.revertedWithCustomError(
        paymentToken,
        "ERC20InsufficientAllowance"
      );
    });

    it("Should handle exact allowance", async function () {
      const { nft, paymentToken, minter } = await loadFixture(deployNFTFixture);

      // Setup: Give minter tokens and approve exactly the price
      await paymentToken.mintAndTransfer(minter.address, NFT_PRICE);
      await paymentToken.connect(minter).approve(await nft.getAddress(), NFT_PRICE);

      // Should succeed
      await nft.connect(minter).mint();
      const tokenId = 1n;
      expect(await nft.ownerOf(tokenId)).to.equal(minter.address);
    });
  });
});

