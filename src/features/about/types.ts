export interface SystemDefinitionItem {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}

export interface CoreConceptItem {
  number: string;
  title: string;
  description: string;
}

export interface DecisionLoopStepItem {
  step: string;
  label: string;
  description: string;
  colorClass: string;
  badgeClass: string;
}

export interface SystemBoundaryItem {
  label: string;
  value: string;
  description: string;
}

export interface AboutPageData {
  header: {
    eyebrow: string;
    title: string;
    subtitle: string;
    badge: string;
    description: string;
    note: string;
  };
  systemDefinition: SystemDefinitionItem[];
  coreConcepts: CoreConceptItem[];
  decisionLoopSteps: DecisionLoopStepItem[];
  systemBoundaries: SystemBoundaryItem[];
}
