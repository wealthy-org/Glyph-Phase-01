export interface ConceptualBlockItem {
  id: string;
  eyebrow: string;
  heading: string;
  paragraphs: string[];
}

export interface DecisionLoopStepItem {
  step: string;
  label: string;
  description: string;
  isHighlighted?: boolean;
}

export interface AboutPageData {
  eyebrow: string;
  heading: string;
  statement: string;
  quote: string;
  conceptualBlocks: ConceptualBlockItem[];
  decisionLoopEyebrow: string;
  decisionLoopHeading: string;
  decisionLoopDescription: string;
  decisionLoopSteps: DecisionLoopStepItem[];
}
