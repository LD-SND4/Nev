export type ProjectTimeUnit = 'days' | 'weeks' | 'months';
export type ProjectComplexity = 'low' | 'medium' | 'high';
export type ProjectRiskLevel = 'low' | 'medium' | 'high';
export type ProjectViabilityStatus = 'Viable with focused scope' | 'Viable with adjustments' | 'Limited budget';

export type ProjectTaskId =
  | 'frontend'
  | 'backend'
  | 'testing'
  | 'maintenance'
  | 'dataAnalysis'
  | 'automation'
  | 'etlScraping'
  | 'reporting';

export type EstimateTask = {
  id: ProjectTaskId;
  label: string;
  category: string;
  estimatedHours: number;
  complexityWeight: number;
  riskWeight: number;
};

export type EstimateConfig = {
  tasks: EstimateTask[];
  complexityMultipliers: Record<ProjectComplexity, number>;
  riskMultipliers: Record<ProjectRiskLevel, number>;
  rangeSpread: { min: number; max: number };
  roundTo: number;
  viableBuffer: number;
  adjustmentBuffer: number;
  timeline: {
    rushWeeks: number;
    focusedWeeks: number;
    comfortableWeeks: number;
    rushMultiplier: number;
    focusedMultiplier: number;
    comfortableMultiplier: number;
  };
};

export type ProjectEstimateInput = {
  availableBudget: number;
  selectedTaskIds: ProjectTaskId[];
  requestedTime: number;
  timeUnit: ProjectTimeUnit;
  complexity: ProjectComplexity;
  riskLevel: ProjectRiskLevel;
  hourlyRate: number;
  companyMargin: number;
  config?: Partial<EstimateConfig>;
};

export type ProjectEstimateResult = {
  minEstimate: number;
  maxEstimate: number;
  referenceEstimate: number;
  availableBudget: number;
  budgetDifference: number;
  status: ProjectViabilityStatus;
  recommendedTimeline: string;
  requestedWeeks: number;
  estimatedHours: number;
  selectedTasks: EstimateTask[];
  formula: string;
};

export const DEFAULT_ESTIMATE_TASKS: EstimateTask[] = [
  { id: 'frontend', label: 'Frontend delivery', category: 'Product UI', estimatedHours: 52, complexityWeight: 1, riskWeight: 1 },
  { id: 'backend', label: 'Backend or APIs', category: 'Systems', estimatedHours: 68, complexityWeight: 1.12, riskWeight: 1.12 },
  { id: 'testing', label: 'Testing and QA', category: 'Quality', estimatedHours: 28, complexityWeight: 0.86, riskWeight: 0.82 },
  { id: 'maintenance', label: 'Maintenance support', category: 'Support', estimatedHours: 22, complexityWeight: 0.72, riskWeight: 0.7 },
  { id: 'dataAnalysis', label: 'Data analysis', category: 'Data', estimatedHours: 34, complexityWeight: 0.9, riskWeight: 0.86 },
  { id: 'automation', label: 'Automation', category: 'Data ops', estimatedHours: 38, complexityWeight: 0.96, riskWeight: 0.98 },
  { id: 'etlScraping', label: 'ETL and web scraping', category: 'Pipelines', estimatedHours: 44, complexityWeight: 1.05, riskWeight: 1.18 },
  { id: 'reporting', label: 'Reporting workflows', category: 'Insights', estimatedHours: 30, complexityWeight: 0.82, riskWeight: 0.78 }
];

export const DEFAULT_ESTIMATE_CONFIG: EstimateConfig = {
  tasks: DEFAULT_ESTIMATE_TASKS,
  complexityMultipliers: { low: 0.9, medium: 1.12, high: 1.35 },
  riskMultipliers: { low: 0.95, medium: 1.1, high: 1.28 },
  rangeSpread: { min: 0.92, max: 1.14 },
  roundTo: 100,
  viableBuffer: 1,
  adjustmentBuffer: 0.72,
  timeline: {
    rushWeeks: 2,
    focusedWeeks: 6,
    comfortableWeeks: 10,
    rushMultiplier: 1.28,
    focusedMultiplier: 1.08,
    comfortableMultiplier: 1
  }
};

export const ESTIMATE_UI_TEXT = {
  estimatedProjectRange: 'Estimated Project Range',
  availableBudget: 'Available Budget',
  workLines: 'Work Lines',
  requestedTime: 'Requested Time',
  budgetAdjustment: 'Budget Adjustment',
  viabilityStatus: 'Viability Status',
  startConversationCta: 'Start Conversation',
  requestProjectGuidanceCta: 'Request Project Guidance'
};

export function calculateProjectEstimate(input: ProjectEstimateInput): ProjectEstimateResult {
  const config = mergeEstimateConfig(input.config);
  const requestedWeeks = normalizeTimeToWeeks(input.requestedTime, input.timeUnit);
  const selectedTasks = config.tasks.filter((task) => input.selectedTaskIds.includes(task.id));
  const baseHours = selectedTasks.reduce((total, task) => total + task.estimatedHours, 0);
  const taskComplexity = averageTaskFactor(selectedTasks, 'complexityWeight');
  const taskRisk = averageTaskFactor(selectedTasks, 'riskWeight');
  const complexityMultiplier = config.complexityMultipliers[input.complexity] * taskComplexity;
  const riskMultiplier = config.riskMultipliers[input.riskLevel] * taskRisk;
  const timelineMultiplier = resolveTimelineMultiplier(requestedWeeks, config);
  const estimatedHours = Math.ceil(baseHours * complexityMultiplier * riskMultiplier * timelineMultiplier);
  const contractorCost = estimatedHours * input.hourlyRate;
  const referenceEstimate = roundTo(contractorCost * input.companyMargin, config.roundTo);
  const minEstimate = roundTo(referenceEstimate * config.rangeSpread.min, config.roundTo);
  const maxEstimate = roundTo(referenceEstimate * config.rangeSpread.max, config.roundTo);
  const budgetDifference = input.availableBudget - referenceEstimate;

  return {
    minEstimate,
    maxEstimate,
    referenceEstimate,
    availableBudget: input.availableBudget,
    budgetDifference,
    status: resolveStatus(input.availableBudget, referenceEstimate, config),
    recommendedTimeline: resolveRecommendedTimeline(selectedTasks.length, requestedWeeks),
    requestedWeeks,
    estimatedHours,
    selectedTasks,
    formula: 'Selected task hours x complexity x timeline pressure x technical risk x hourly rate x company margin, returned as a rounded client reference range.'
  };
}

export function normalizeTimeToWeeks(value: number, unit: ProjectTimeUnit): number {
  if (unit === 'days') return Math.max(value / 5, 0.2);
  if (unit === 'months') return value * 4;
  return Math.max(value, 0.2);
}

export const SAMPLE_PROJECT_ESTIMATE = calculateProjectEstimate({
  availableBudget: 2000,
  selectedTaskIds: ['frontend', 'backend', 'testing'],
  requestedTime: 6,
  timeUnit: 'weeks',
  complexity: 'medium',
  riskLevel: 'medium',
  hourlyRate: 20,
  companyMargin: 1.35
});

function mergeEstimateConfig(config?: Partial<EstimateConfig>): EstimateConfig {
  return {
    ...DEFAULT_ESTIMATE_CONFIG,
    ...config,
    timeline: { ...DEFAULT_ESTIMATE_CONFIG.timeline, ...config?.timeline },
    rangeSpread: { ...DEFAULT_ESTIMATE_CONFIG.rangeSpread, ...config?.rangeSpread },
    complexityMultipliers: { ...DEFAULT_ESTIMATE_CONFIG.complexityMultipliers, ...config?.complexityMultipliers },
    riskMultipliers: { ...DEFAULT_ESTIMATE_CONFIG.riskMultipliers, ...config?.riskMultipliers },
    tasks: config?.tasks ?? DEFAULT_ESTIMATE_TASKS
  };
}

function averageTaskFactor(tasks: EstimateTask[], key: 'complexityWeight' | 'riskWeight'): number {
  if (!tasks.length) return 1;
  return tasks.reduce((total, task) => total + task[key], 0) / tasks.length;
}

function resolveTimelineMultiplier(weeks: number, config: EstimateConfig): number {
  if (weeks <= config.timeline.rushWeeks) return config.timeline.rushMultiplier;
  if (weeks <= config.timeline.focusedWeeks) return config.timeline.focusedMultiplier;
  return config.timeline.comfortableMultiplier;
}

function resolveStatus(availableBudget: number, referenceEstimate: number, config: EstimateConfig): ProjectViabilityStatus {
  if (availableBudget >= referenceEstimate * config.viableBuffer) return 'Viable with focused scope';
  if (availableBudget >= referenceEstimate * config.adjustmentBuffer) return 'Viable with adjustments';
  return 'Limited budget';
}

function resolveRecommendedTimeline(taskCount: number, requestedWeeks: number): string {
  const minimumWeeks = taskCount >= 5 ? 10 : taskCount >= 3 ? 6 : 3;
  const recommendedWeeks = Math.max(minimumWeeks, Math.ceil(requestedWeeks));
  return `${recommendedWeeks}-${recommendedWeeks + 4} weeks recommended`;
}

function roundTo(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}
