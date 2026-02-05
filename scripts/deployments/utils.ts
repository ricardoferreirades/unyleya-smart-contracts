import { ParsedArgs, DeploymentParams } from "./types";

export function parseArgs(): ParsedArgs {
  // Hardhat v2 doesn't allow arbitrary flags, so we use environment variables
  // as the primary method, with command-line args as fallback for direct execution
  const args = process.argv.slice(2);
  
  const parsed: ParsedArgs = {
    contract: process.env.DEPLOY_CONTRACT || null,
    network: process.env.DEPLOY_NETWORK || null,
    params: {
      name: process.env.TOKEN_NAME || process.env.NFT_NAME || undefined,
      symbol: process.env.TOKEN_SYMBOL || process.env.NFT_SYMBOL || undefined,
      tokenAddress: process.env.PAYMENT_TOKEN_ADDRESS || undefined,
      price: process.env.NFT_PRICE || undefined,
    },
  };

  // Also parse command-line args for direct script execution (when not using npm)
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === "--contract" || arg === "-c") {
      parsed.contract = args[++i];
    } else if (arg === "--network" || arg === "-n") {
      parsed.network = args[++i];
    } else if (arg === "--name") {
      parsed.params.name = args[++i];
    } else if (arg === "--symbol") {
      parsed.params.symbol = args[++i];
    } else if (arg === "--token-address") {
      parsed.params.tokenAddress = args[++i];
    } else if (arg === "--price") {
      parsed.params.price = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
  }

  return parsed;
}

export function printUsage(): void {
  console.log(`
Usage: npx hardhat run scripts/deploy.ts [OPTIONS] --network <network>

Options:
  --contract, -c <name>        Contract name to deploy (required)
                               Available: PaymentToken, NFT
  
  --network, -n <network>      Network to deploy to (optional, defaults to hardhat)
                               Available: hardhat, localhost, sepolia, etc.

Contract-specific parameters:

  PaymentToken:
    --name <string>            Token name (required for PaymentToken)
    --symbol <string>          Token symbol (required for PaymentToken)

  NFT:
    --token-address <address>  Payment token contract address (required for NFT)
    --price <amount>           Price per NFT in payment token units (required for NFT)
                               Format: "10" (for 10 tokens) or wei amount
    --name <string>            NFT collection name (required for NFT)
    --symbol <string>          NFT collection symbol (required for NFT)

Examples:
  # Deploy PaymentToken to hardhat network
  npx hardhat run scripts/deploy.ts --contract PaymentToken --name "My Token" --symbol "MTK"

  # Deploy PaymentToken to sepolia
  npx hardhat run scripts/deploy.ts --contract PaymentToken --name "My Token" --symbol "MTK" --network sepolia

  # Deploy NFT contract
  npx hardhat run scripts/deploy.ts --contract NFT --token-address 0x... --price "10" --name "My NFT" --symbol "MNFT" --network sepolia
`);
}

import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function validateNetwork(hre: HardhatRuntimeEnvironment): Promise<void> {
  const network = hre.network.name;
  const networkConfig = hre.network.config as any; // Type assertion for network config
  
  // Access ethers through type assertion (Hardhat v2 with @nomicfoundation/hardhat-ethers)
  const ethers = (hre as any).ethers;
  
  if (network !== "hardhat" && network !== "localhost") {
    if (!networkConfig.url || networkConfig.url === "") {
      throw new Error(
        `❌ Error: ${network.toUpperCase()}_URL is not set in your .env file.\n` +
        `Please add ${network.toUpperCase()}_URL=https://your-rpc-url to your .env file.`
      );
    }
    
    const accounts = Array.isArray(networkConfig.accounts) 
      ? networkConfig.accounts 
      : (networkConfig.accounts?.length ? [networkConfig.accounts] : []);
    
    if (!accounts || accounts.length === 0) {
      throw new Error(
        `❌ Error: ${network.toUpperCase()}_PRIVATE_KEY is not set or invalid in your .env file.\n` +
        `Please add a valid private key (64 hex characters) to your .env file.`
      );
    }
    
    console.log(`\n📡 Connecting to ${network} network...`);
    console.log(`🔗 RPC URL: ${networkConfig.url.substring(0, 30)}...`);
    const signers = await ethers.getSigners();
    console.log(`👤 Deployer: ${signers[0].address}\n`);
  } else {
    console.log(`\n📡 Using ${network} network...`);
    const signers = await ethers.getSigners();
    console.log(`👤 Deployer: ${signers[0].address}\n`);
  }
}

