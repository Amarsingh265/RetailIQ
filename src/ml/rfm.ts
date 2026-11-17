import { RetailTransaction, CustomerRFM } from '../types';

export interface PreprocessingResult {
  customers: CustomerRFM[];
  rawMatrix: number[][]; // [N, numFeatures]
  scaledMatrix: number[][]; // StandardScaled
  featureNames: string[];
  means: number[];
  stds: number[];
}

/**
 * Calculates customer-level RFM features from transactions.
 * Filters out cancellations and invalid records.
 */
export function calculateRFM(transactions: RetailTransaction[]): CustomerRFM[] {
  // Only use valid sales records (positive quantity and price, valid customerId, not cancelled)
  const validTx = transactions.filter(
    (t) =>
      t.CustomerID &&
      t.CustomerID.trim() !== '' &&
      !t.IsCancelled &&
      !t.Invoice.startsWith('C') &&
      t.Quantity > 0 &&
      t.Price > 0
  );

  if (validTx.length === 0) return [];

  // Determine dataset reference date (max invoice date in dataset + 1 day)
  let maxTime = 0;
  validTx.forEach((t) => {
    const time = new Date(t.InvoiceDate).getTime();
    if (!isNaN(time) && time > maxTime) {
      maxTime = time;
    }
  });

  const referenceDate = new Date(maxTime || Date.now());

  // Group by customer
  const customerMap = new Map<
    string,
    {
      invoices: Set<string>;
      dates: Date[];
      totalSpent: number;
      totalQty: number;
      products: Set<string>;
      country: string;
    }
  >();

  validTx.forEach((t) => {
    const cid = String(t.CustomerID).trim();
    if (!customerMap.has(cid)) {
      customerMap.set(cid, {
        invoices: new Set(),
        dates: [],
        totalSpent: 0,
        totalQty: 0,
        products: new Set(),
        country: t.Country || 'United Kingdom'
      });
    }

    const cData = customerMap.get(cid)!;
    cData.invoices.add(t.Invoice);
    const d = new Date(t.InvoiceDate);
    if (!isNaN(d.getTime())) cData.dates.push(d);
    
    const amount = t.TotalAmount !== undefined ? t.TotalAmount : t.Quantity * t.Price;
    cData.totalSpent += amount;
    cData.totalQty += t.Quantity;
    if (t.StockCode) cData.products.add(t.StockCode);
  });

  const customers: CustomerRFM[] = [];

  customerMap.forEach((data, customerId) => {
    // Sort dates ascending
    data.dates.sort((a, b) => a.getTime() - b.getTime());
    const lastDate = data.dates[data.dates.length - 1] || referenceDate;
    const firstDate = data.dates[0] || referenceDate;

    // Recency: Days from last purchase to reference date
    const diffTime = Math.max(0, referenceDate.getTime() - lastDate.getTime());
    const recency = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const frequency = Math.max(1, data.invoices.size);
    const monetary = Math.max(0.01, +data.totalSpent.toFixed(2));
    const avgOrderValue = +(monetary / frequency).toFixed(2);
    const totalQuantity = data.totalQty;
    const productCount = data.products.size;

    // Historical CLV: cumulative spend
    const clvHistorical = monetary;

    // Predictive CLV (Simplified transparent formula based on customer retention and AOV)
    // CLV = (AOV * Frequency per year) * Expected Lifespan (e.g. 2.5 years) * Margin (0.20)
    const annualFrequencyEstimate = frequency * (365 / Math.max(30, recency + 30));
    const clvPredictive = +(avgOrderValue * Math.min(24, Math.max(1, annualFrequencyEstimate)) * 0.25 * 2.0).toFixed(2);

    // Churn Risk heuristic based on recency and past frequency
    let churnRisk: 'Low' | 'Medium' | 'High' = 'Low';
    if (recency > 90) churnRisk = 'High';
    else if (recency > 45) churnRisk = 'Medium';

    customers.push({
      customerId,
      recency,
      frequency,
      monetary,
      avgOrderValue,
      totalQuantity,
      productCount,
      firstPurchaseDate: firstDate.toISOString().split('T')[0],
      lastPurchaseDate: lastDate.toISOString().split('T')[0],
      country: data.country,
      clvHistorical,
      clvPredictive,
      churnRisk
    });
  });

  return customers;
}

/**
 * Prepares and standardizes feature matrices for clustering.
 * Applies log1p transformation for skewness and StandardScaler for zero-mean unit-variance.
 */
export function preprocessRFMForClustering(customers: CustomerRFM[]): PreprocessingResult {
  const featureNames = ['Log(Recency)', 'Log(Frequency)', 'Log(Monetary)', 'Log(AOV)'];
  
  // 1. Log transform skewed features
  const rawMatrix = customers.map((c) => [
    Math.log1p(c.recency),
    Math.log1p(c.frequency),
    Math.log1p(c.monetary),
    Math.log1p(c.avgOrderValue)
  ]);

  if (rawMatrix.length === 0) {
    return {
      customers,
      rawMatrix: [],
      scaledMatrix: [],
      featureNames,
      means: [],
      stds: []
    };
  }

  const numFeatures = featureNames.length;
  const numSamples = rawMatrix.length;

  // 2. Calculate mean for each feature
  const means = new Array(numFeatures).fill(0);
  for (let i = 0; i < numSamples; i++) {
    for (let j = 0; j < numFeatures; j++) {
      means[j] += rawMatrix[i][j];
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    means[j] /= numSamples;
  }

  // 3. Calculate std deviation for each feature
  const stds = new Array(numFeatures).fill(0);
  for (let i = 0; i < numSamples; i++) {
    for (let j = 0; j < numFeatures; j++) {
      stds[j] += Math.pow(rawMatrix[i][j] - means[j], 2);
    }
  }
  for (let j = 0; j < numFeatures; j++) {
    stds[j] = Math.sqrt(stds[j] / (numSamples - 1 || 1)) || 1e-6;
  }

  // 4. StandardScale (z-score)
  const scaledMatrix = rawMatrix.map((row) =>
    row.map((val, j) => (val - means[j]) / stds[j])
  );

  return {
    customers,
    rawMatrix,
    scaledMatrix,
    featureNames,
    means,
    stds
  };
}
