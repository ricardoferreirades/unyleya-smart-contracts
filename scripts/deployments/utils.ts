import { ParsedArgs, DeploymentParams } from "./types";

export function parseArgs(): ParsedArgs {
  // Hardhat v2 doesn't allow arbitrary flags, so we use environment variables
  // as the primary method, with command-line args as fallback for direct execution
  const args = process.argv.slice(2);
  
  const parsed: ParsedArgs = {
    contract: process.env.DEPLOY_CONTRACT || null,
    network: process.env.DEPLOY_NETWORK || null,
    params: {
      name: process.env.TOKEN_NAME || undefined,
      symbol: process.env.TOKEN_SYMBOL || undefined,
      unlockTime: process.env.UNLOCK_TIME ? parseInt(process.env.UNLOCK_TIME) : undefined,
      lockedAmount: process.env.LOCKED_AMOUNT || undefined,
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
    } else if (arg === "--unlock-time") {
      parsed.params.unlockTime = parseInt(args[++i]);
    } else if (arg === "--locked-amount") {
      parsed.params.lockedAmount = args[++i];
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
                               Available: PaymentToken, Lock
  
  --network, -n <network>      Network to deploy to (optional, defaults to hardhat)
                               Available: hardhat, localhost, sepolia, etc.

Contract-specific parameters:

  PaymentToken:
    --name <string>            Token name (required for PaymentToken)
    --symbol <string>          Token symbol (required for PaymentToken)

  Lock:
    --unlock-time <seconds>    Unlock timestamp in seconds (required for Lock)
                               Can be absolute timestamp or relative seconds from now
    --locked-amount <amount>   Amount of ETH to lock (optional, defaults to 0.001 ETH)
                               Format: "0.001" or "1.5"

Examples:
  # Deploy PaymentToken to hardhat network
  npx hardhat run scripts/deploy.ts --contract PaymentToken --name "My Token" --symbol "MTK"

  # Deploy PaymentToken to sepolia
  npx hardhat run scripts/deploy.ts --contract PaymentToken --name "My Token" --symbol "MTK" --network sepolia

  # Deploy Lock contract with unlock time 1 hour from now
  npx hardhat run scripts/deploy.ts --contract Lock --unlock-time 3600 --network sepolia

  # Deploy Lock with custom amount
  npx hardhat run scripts/deploy.ts --contract Lock --unlock-time 3600 --locked-amount "0.1" --network sepolia
`);
}

import { HardhatRuntimeEnvironment } from "hardhat/types";

export async function validateNetwork(hre: HardhatRuntimeEnvironment): Promise<void> {
  const network = hre.network.name;
  const networkConfig = hre.network.config;
  
  if (network !== "hardhat" && network !== "localhost") {
    if (!networkConfig.url || networkConfig.url === "") {
      throw new Error(
        `❌ Error: ${network.toUpperCase()}_URL is not set in your .env file.\n` +
        `Please add ${network.toUpperCase()}_URL=https://your-rpc-url to your .env file.`
      );
    }
    
    if (!networkConfig.accounts || networkConfig.accounts.length === 0) {
      throw new Error(
        `❌ Error: ${network.toUpperCase()}_PRIVATE_KEY is not set or invalid in your .env file.\n` +
        `Please add a valid private key (64 hex characters) to your .env file.`
      );
    }
    
    console.log(`\n📡 Connecting to ${network} network...`);
    console.log(`🔗 RPC URL: ${networkConfig.url.substring(0, 30)}...`);
    const signers = await hre.ethers.getSigners();
    console.log(`👤 Deployer: ${signers[0].address}\n`);
  } else {
    console.log(`\n📡 Using ${network} network...`);
    const signers = await hre.ethers.getSigners();
    console.log(`👤 Deployer: ${signers[0].address}\n`);
  }
}

