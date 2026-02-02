// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PaymentToken
 * @dev ERC-20 token used as payment currency for NFT marketplace
 * @notice Only the owner can mint and transfer tokens via mintAndTransfer function
 */
contract PaymentToken is ERC20, Ownable {
    /**
     * @dev Emitted when tokens are minted and transferred
     * @param from The address that minted the tokens (owner)
     * @param to The address that received the tokens
     * @param amount The amount of tokens minted and transferred
     */
    event MintAndTransfer(address indexed from, address indexed to, uint256 amount);

    /**
     * @dev Constructor that sets the token name and symbol
     * @param name The name of the token
     * @param symbol The symbol of the token
     * @notice Decimals are set to 18 by default (ERC20 standard)
     */
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {
        // Decimals default to 18 in OpenZeppelin's ERC20 implementation
    }

    /**
     * @dev Mints tokens to the owner and then transfers them to the recipient
     * @param to The address to receive the tokens
     * @param amount The amount of tokens to mint and transfer
     * @notice Only the owner can call this function
     * @notice Reverts if `to` is the zero address
     * @notice Emits both Transfer events (from _mint and _transfer) and MintAndTransfer event
     */
    function mintAndTransfer(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "PaymentToken: cannot transfer to zero address");
        
        // Mint to owner first, then transfer to recipient
        // This ensures the owner's balance is updated first, then the transfer occurs
        _mint(owner(), amount);
        _transfer(owner(), to, amount);
        
        emit MintAndTransfer(owner(), to, amount);
    }
}

