// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NFT
 * @dev ERC-721 NFT contract that requires payment in ERC-20 tokens to mint
 * @notice Users must approve this contract to spend PAY tokens before minting
 */
contract NFT is ERC721, ERC721URIStorage, Ownable {
    /// @dev Address of the ERC-20 payment token contract
    IERC20 public immutable paymentToken;
    
    /// @dev Price of each NFT in payment token units (respecting decimals)
    uint256 public price;
    
    /// @dev Counter for token IDs
    uint256 private _tokenIdCounter;
    
    /// @dev Base URI for token metadata
    string private _baseTokenURI;
    
    /**
     * @dev Emitted when an NFT is minted
     * @param to The address that received the NFT
     * @param tokenId The ID of the minted token
     * @param pricePaid The amount of payment tokens paid
     */
    event Minted(address indexed to, uint256 indexed tokenId, uint256 pricePaid);
    
    /**
     * @dev Emitted when the price is updated
     * @param oldPrice The previous price
     * @param newPrice The new price
     */
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    /**
     * @dev Constructor that sets the payment token address and initial price
     * @param tokenAddress The address of the ERC-20 payment token contract
     * @param _price The initial price of each NFT in payment token units
     * @param name The name of the NFT collection
     * @param symbol The symbol of the NFT collection
     */
    constructor(
        address tokenAddress,
        uint256 _price,
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        require(tokenAddress != address(0), "NFT: token address cannot be zero");
        require(_price > 0, "NFT: price must be greater than zero");
        
        paymentToken = IERC20(tokenAddress);
        price = _price;
        _tokenIdCounter = 1; // Start token IDs at 1
    }
    
    /**
     * @dev Mints an NFT to the caller after receiving payment in ERC-20 tokens
     * @notice The caller must first approve this contract to spend `price` tokens
     * @notice Even the owner must pay to mint NFTs
     * @return tokenId The ID of the minted token
     */
    function mint() external returns (uint256) {
        return mintTo(msg.sender);
    }
    
    /**
     * @dev Mints an NFT to a specific address after receiving payment from the caller
     * @param to The address that will receive the NFT
     * @notice The caller must first approve this contract to spend `price` tokens
     * @return tokenId The ID of the minted token
     */
    function mintTo(address to) public returns (uint256) {
        require(to != address(0), "NFT: cannot mint to zero address");
        
        // Transfer payment tokens from caller to contract owner
        require(
            paymentToken.transferFrom(msg.sender, owner(), price),
            "NFT: payment transfer failed"
        );
        
        // Mint the NFT
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        
        emit Minted(to, tokenId, price);
        
        return tokenId;
    }
    
    /**
     * @dev Sets the price of each NFT
     * @param newPrice The new price in payment token units
     * @notice Only the owner can call this function
     * @notice Price must be greater than zero
     */
    function setPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "NFT: price must be greater than zero");
        
        uint256 oldPrice = price;
        price = newPrice;
        
        emit PriceUpdated(oldPrice, newPrice);
    }
    
    /**
     * @dev Sets the base URI for token metadata
     * @param baseURI The base URI string
     * @notice Only the owner can call this function
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Sets the URI for a specific token
     * @param tokenId The ID of the token
     * @param _tokenURI The URI string for the token
     * @notice Only the owner can call this function
     */
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }
    
    /**
     * @dev Returns the token URI for a given token ID
     * @param tokenId The ID of the token
     * @return The URI string for the token
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Returns the base URI for token metadata
     * @return The base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    /**
     * @dev Returns the next token ID that will be minted
     * @return The next token ID
     */
    function nextTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Returns the total number of tokens minted
     * @return The total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    /**
     * @dev Override required by Solidity
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

