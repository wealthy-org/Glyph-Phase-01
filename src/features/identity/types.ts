export interface IdentityStandard {
  standard: string;
  subtext: string;
}

export interface IdentityNetwork {
  name: string;
  chainId: string | number;
}

export interface IdentityGenesis {
  epoch: string;
  block: string;
}

export interface ArchitectureItem {
  index: string;
  domain: string;
  name: string;
  description: string;
}

export interface IdentityData {
  beingNumber: string;
  agentId: string;
  agentIdFormatted: string;
  name: string;
  status: string;
  standard: IdentityStandard;
  network: IdentityNetwork;
  genesis: IdentityGenesis;
  primaryWallet: string;
  registrationTx: string;
  registrationNetwork: string;
  explorerBaseUrl: string;
  architectureItems?: ArchitectureItem[];
}
