export interface DeploymentParams {
  name?: string;
  symbol?: string;
  tokenAddress?: string;
  price?: string;
}

export interface ParsedArgs {
  contract: string | null;
  network: string | null;
  params: DeploymentParams;
}

