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

export interface ReputationMetricItem {
  label: string;
  value: number | string;
  highlight?: boolean;
}

export interface ArchitectureCardItem {
  title: string;
  description: string;
  metaKey: string;
  metaValue: string;
  iconType: "standard" | "delegation";
}

export interface IdentityData {
  beingNumber: string;
  name: string;
  status: string;
  standard: IdentityStandard;
  network: IdentityNetwork;
  genesis: IdentityGenesis;
  primaryWallet: string;
  registrationTx: string;
  registrationNetwork: string;
  explorerBaseUrl: string;
  reputationMetrics: ReputationMetricItem[];
  architectureCards: ArchitectureCardItem[];
}
