export type UserRole = 'retailer' | 'analyst' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  active: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface RetailTransaction {
  Invoice: string;
  StockCode: string;
  Description: string;
  Quantity: number;
  InvoiceDate: string; // ISO string or YYYY-MM-DD HH:MM:SS
  Price: number;       // Unit price in GBP £
  CustomerID: string;  // Customer ID
  Country: string;
  TotalAmount?: number; // Calculated: Quantity * Price
  IsCancelled?: boolean;
}

export interface DatasetSummary {
  id: string;
  name: string;
  source: string;
  uploadedAt: string;
  totalRawRows: number;
  totalCleanedRows: number;
  missingCustomerIdsRemoved: number;
  cancellationsRemoved: number;
  invalidPricesRemoved: number;
  duplicateRowsRemoved: number;
  uniqueCustomers: number;
  uniqueProducts: number;
  uniqueInvoices: number;
  totalRevenue: number;
  dateRange: {
    start: string;
    end: string;
  };
  countriesCount: number;
  isActive: boolean;
}

export interface CustomerRFM {
  customerId: string;
  recency: number;     // Days since last purchase relative to reference date
  frequency: number;   // Number of distinct orders
  monetary: number;    // Total revenue spent (£)
  avgOrderValue: number;
  totalQuantity: number;
  productCount: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  country: string;
  grade?: CustomerGrade;
  clusterId?: number;
  segmentName?: string;
  segmentDescription?: string;
  purchaseProbability?: number; // Random forest predicted probability (0 to 1)
  predictedPurchaseClass?: 0 | 1; // 1 = Will purchase in next 30 days
  churnRisk?: 'Low' | 'Medium' | 'High';
  clvHistorical?: number;
  clvPredictive?: number;
}

export type CustomerGrade = 'F1' | 'F2' | 'F3';

export interface CustomerGradeThresholds {
  lowerPercentile: number;
  upperPercentile: number;
  recentPurchaseMaxDays: number;
  longInactivityMinDays: number;
  lowFrequencyMaxOrders: number;
  highFrequencyMinOrders: number;
  lowSpendingMax: number;
  highSpendingMin: number;
}

export interface CustomerGradeDistribution {
  grade: CustomerGrade;
  label: string;
  description: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ClusterProfile {
  id: number;
  name: string;
  color: string;
  customerCount: number;
  percentage: number;
  avgRecency: number;
  avgFrequency: number;
  avgMonetary: number;
  avgAOV: number;
  totalSegmentRevenue: number;
  description: string;
  strategy: string;
}

export interface KMeansMetrics {
  k: number;
  inertia: number;
  silhouetteScore: number;
  elbowPoints: { k: number; inertia: number }[];
  silhouetteScores: { k: number; score: number }[];
  clusters: ClusterProfile[];
  trainedAt: string;
  featureNames: string[];
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export interface ClassificationReport {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  support0: number;
  support1: number;
  totalTestSamples: number;
}

export interface ROCPoint {
  fpr: number;
  tpr: number;
  threshold: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number; // 0 to 1
  description: string;
}

export interface RandomForestMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  aucRoc: number;
  confusionMatrix: ConfusionMatrix;
  classificationReport: ClassificationReport;
  rocCurve: ROCPoint[];
  featureImportances: FeatureImportance[];
  trainSplit: number; // e.g. 0.70
  valSplit: number;   // e.g. 0.15
  testSplit: number;  // e.g. 0.15
  nEstimators: number;
  maxDepth: number;
  trainedAt: string;
  targetDefinition: string; // "Purchase in next 30 days (1=Yes, 0=No)"
}

export interface AssociationRule {
  itemA: string;
  itemB: string;
  support: number;
  confidence: number;
  lift: number;
  occurrences: number;
}

export interface SalesForecastPoint {
  date: string;
  month: string;
  actualRevenue: number;
  forecastRevenue?: number;
  lowerConfidence?: number;
  upperConfidence?: number;
  isForecast: boolean;
}

export interface BusinessRecommendation {
  id: string;
  title: string;
  targetSegment: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'Low' | 'Medium' | 'High';
  rationale: string;
  supportingData: string;
  suggestedAction: string;
  category: 'Retention' | 'Revenue' | 'Loyalty' | 'Cross-Sell' | 'Re-Engagement';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}
