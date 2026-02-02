export interface DeploymentParams {
  name?: string;
  symbol?: string;
  unlockTime?: number;
  lockedAmount?: string;
}

export interface ParsedArgs {
  contract: string | null;
  network: string | null;
  params: DeploymentParams;
}

