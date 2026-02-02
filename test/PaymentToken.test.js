const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");

describe("PaymentToken", function () {
  const TOKEN_NAME = "Payment Token";
  const TOKEN_SYMBOL = "PAY";
  const INITIAL_SUPPLY = ethers.parseEther("0");
  const MINT_AMOUNT = ethers.parseEther("1000");

  async function deployPaymentTokenFixture() {
    const [owner, recipient, otherAccount] = await ethers.getSigners();

    const PaymentToken = await ethers.getContractFactory("PaymentToken");
    const paymentToken = await PaymentToken.deploy(TOKEN_NAME, TOKEN_SYMBOL);

    return { paymentToken, owner, recipient, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { paymentToken, owner } = await loadFixture(deployPaymentTokenFixture);

      expect(await paymentToken.owner()).to.equal(owner.address);
    });

    it("Should set the correct name", async function () {
      const { paymentToken } = await loadFixture(deployPaymentTokenFixture);

      expect(await paymentToken.name()).to.equal(TOKEN_NAME);
    });

    it("Should set the correct symbol", async function () {
      const { paymentToken } = await loadFixture(deployPaymentTokenFixture);

      expect(await paymentToken.symbol()).to.equal(TOKEN_SYMBOL);
    });

    it("Should have 18 decimals", async function () {
      const { paymentToken } = await loadFixture(deployPaymentTokenFixture);

      expect(await paymentToken.decimals()).to.equal(18);
    });

    it("Should have zero initial supply", async function () {
      const { paymentToken } = await loadFixture(deployPaymentTokenFixture);

      expect(await paymentToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    });
  });

  describe("mintAndTransfer", function () {
    describe("Validations", function () {
      it("Should revert if caller is not the owner", async function () {
        const { paymentToken, recipient, otherAccount } = await loadFixture(
          deployPaymentTokenFixture
        );

        await expect(
          paymentToken.connect(otherAccount).mintAndTransfer(recipient.address, MINT_AMOUNT)
        ).to.be.revertedWithCustomError(paymentToken, "OwnableUnauthorizedAccount");
      });

      it("Should revert if recipient is zero address", async function () {
        const { paymentToken } = await loadFixture(deployPaymentTokenFixture);

        await expect(
          paymentToken.mintAndTransfer(ethers.ZeroAddress, MINT_AMOUNT)
        ).to.be.revertedWith("PaymentToken: cannot transfer to zero address");
      });
    });

    describe("Transfers", function () {
      it("Should transfer the correct amount to recipient", async function () {
        const { paymentToken, recipient } = await loadFixture(deployPaymentTokenFixture);

        await paymentToken.mintAndTransfer(recipient.address, MINT_AMOUNT);

        expect(await paymentToken.balanceOf(recipient.address)).to.equal(MINT_AMOUNT);
      });

      it("Should update totalSupply correctly", async function () {
        const { paymentToken, recipient } = await loadFixture(deployPaymentTokenFixture);

        await paymentToken.mintAndTransfer(recipient.address, MINT_AMOUNT);

        expect(await paymentToken.totalSupply()).to.equal(MINT_AMOUNT);
      });

      it("Should not leave tokens in owner's balance after transfer", async function () {
        const { paymentToken, owner, recipient } = await loadFixture(
          deployPaymentTokenFixture
        );

        await paymentToken.mintAndTransfer(recipient.address, MINT_AMOUNT);

        // Owner should have zero balance after mint and transfer
        expect(await paymentToken.balanceOf(owner.address)).to.equal(0);
      });

      it("Should handle multiple mintAndTransfer calls correctly", async function () {
        const { paymentToken, recipient } = await loadFixture(deployPaymentTokenFixture);

        const amount1 = ethers.parseEther("500");
        const amount2 = ethers.parseEther("300");

        await paymentToken.mintAndTransfer(recipient.address, amount1);
        await paymentToken.mintAndTransfer(recipient.address, amount2);

        expect(await paymentToken.balanceOf(recipient.address)).to.equal(
          amount1 + amount2
        );
        expect(await paymentToken.totalSupply()).to.equal(amount1 + amount2);
      });

      it("Should transfer to different recipients correctly", async function () {
        const { paymentToken, recipient, otherAccount } = await loadFixture(
          deployPaymentTokenFixture
        );

        const amount1 = ethers.parseEther("500");
        const amount2 = ethers.parseEther("300");

        await paymentToken.mintAndTransfer(recipient.address, amount1);
        await paymentToken.mintAndTransfer(otherAccount.address, amount2);

        expect(await paymentToken.balanceOf(recipient.address)).to.equal(amount1);
        expect(await paymentToken.balanceOf(otherAccount.address)).to.equal(amount2);
        expect(await paymentToken.totalSupply()).to.equal(amount1 + amount2);
      });
    });

    describe("Events", function () {
      it("Should emit Transfer event from zero address to owner on mint", async function () {
        const { paymentToken, owner, recipient } = await loadFixture(
          deployPaymentTokenFixture
        );

        await expect(paymentToken.mintAndTransfer(recipient.address, MINT_AMOUNT))
          .to.emit(paymentToken, "Transfer")
          .withArgs(ethers.ZeroAddress, owner.address, MINT_AMOUNT);
      });

      it("Should emit Transfer event from owner to recipient", async function () {
        const { paymentToken, owner, recipient } = await loadFixture(
          deployPaymentTokenFixture
        );

        await expect(paymentToken.mintAndTransfer(recipient.address, MINT_AMOUNT))
          .to.emit(paymentToken, "Transfer")
          .withArgs(owner.address, recipient.address, MINT_AMOUNT);
      });

      it("Should emit MintAndTransfer event", async function () {
        const { paymentToken, owner, recipient } = await loadFixture(
          deployPaymentTokenFixture
        );

        await expect(paymentToken.mintAndTransfer(recipient.address, MINT_AMOUNT))
          .to.emit(paymentToken, "MintAndTransfer")
          .withArgs(owner.address, recipient.address, MINT_AMOUNT);
      });
    });
  });

  describe("ERC20 Standard Functions", function () {
    it("Should allow standard transfer after receiving tokens", async function () {
      const { paymentToken, recipient, otherAccount } = await loadFixture(
        deployPaymentTokenFixture
      );

      await paymentToken.mintAndTransfer(recipient.address, MINT_AMOUNT);

      const transferAmount = ethers.parseEther("100");
      await paymentToken.connect(recipient).transfer(otherAccount.address, transferAmount);

      expect(await paymentToken.balanceOf(recipient.address)).to.equal(
        MINT_AMOUNT - transferAmount
      );
      expect(await paymentToken.balanceOf(otherAccount.address)).to.equal(transferAmount);
    });

    it("Should allow approve and transferFrom (DApp flow)", async function () {
      const { paymentToken, recipient, otherAccount } = await loadFixture(
        deployPaymentTokenFixture
      );

      // Mint tokens to recipient
      await paymentToken.mintAndTransfer(recipient.address, MINT_AMOUNT);

      const approveAmount = ethers.parseEther("500");
      const nftContractAddress = otherAccount.address; // Simulating NFT contract address

      // Recipient approves NFT contract to spend tokens
      await paymentToken.connect(recipient).approve(nftContractAddress, approveAmount);

      // Check allowance
      expect(
        await paymentToken.allowance(recipient.address, nftContractAddress)
      ).to.equal(approveAmount);

      // NFT contract transfers tokens from recipient
      const transferAmount = ethers.parseEther("200");
      await paymentToken
        .connect(otherAccount)
        .transferFrom(recipient.address, otherAccount.address, transferAmount);

      // Verify balances
      expect(await paymentToken.balanceOf(recipient.address)).to.equal(
        MINT_AMOUNT - transferAmount
      );
      expect(await paymentToken.balanceOf(otherAccount.address)).to.equal(transferAmount);
      expect(
        await paymentToken.allowance(recipient.address, nftContractAddress)
      ).to.equal(approveAmount - transferAmount);
    });

    it("Should revert transferFrom if allowance is insufficient", async function () {
      const { paymentToken, recipient, otherAccount } = await loadFixture(
        deployPaymentTokenFixture
      );

      await paymentToken.mintAndTransfer(recipient.address, MINT_AMOUNT);

      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("200");

      await paymentToken.connect(recipient).approve(otherAccount.address, approveAmount);

      await expect(
        paymentToken
          .connect(otherAccount)
          .transferFrom(recipient.address, otherAccount.address, transferAmount)
      ).to.be.revertedWithCustomError(paymentToken, "ERC20InsufficientAllowance");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small amounts", async function () {
      const { paymentToken, recipient } = await loadFixture(deployPaymentTokenFixture);

      const smallAmount = 1; // 1 wei
      await paymentToken.mintAndTransfer(recipient.address, smallAmount);

      expect(await paymentToken.balanceOf(recipient.address)).to.equal(smallAmount);
      expect(await paymentToken.totalSupply()).to.equal(smallAmount);
    });

    it("Should handle very large amounts", async function () {
      const { paymentToken, recipient } = await loadFixture(deployPaymentTokenFixture);

      const largeAmount = ethers.parseEther("1000000000"); // 1 billion tokens
      await paymentToken.mintAndTransfer(recipient.address, largeAmount);

      expect(await paymentToken.balanceOf(recipient.address)).to.equal(largeAmount);
      expect(await paymentToken.totalSupply()).to.equal(largeAmount);
    });
  });
});

