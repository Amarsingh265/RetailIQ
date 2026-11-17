import {
  RetailTransaction,
  CustomerRFM,
  AssociationRule,
  SalesForecastPoint,
  BusinessRecommendation,
  ClusterProfile
} from '../types';

/**
 * Calculates Market Basket Association Rules from real invoice line-items.
 * Computes Support, Confidence, and Lift for co-occurring products.
 */
export function calculateAssociationRules(
  transactions: RetailTransaction[],
  minSupportCount: number = 4
): AssociationRule[] {
  // Group products by invoice
  const invoiceBaskets = new Map<string, Set<string>>();

  transactions.forEach((t) => {
    if (!t.Invoice.startsWith('C') && t.Quantity > 0 && t.Description) {
      if (!invoiceBaskets.has(t.Invoice)) {
        invoiceBaskets.set(t.Invoice, new Set());
      }
      invoiceBaskets.get(t.Invoice)!.add(t.Description.trim());
    }
  });

  const totalBaskets = invoiceBaskets.size;
  if (totalBaskets === 0) return [];

  // Count item individual frequencies
  const itemCounts = new Map<string, number>();
  // Count pair frequencies
  const pairCounts = new Map<string, number>();

  invoiceBaskets.forEach((basket) => {
    const items = Array.from(basket);
    for (let i = 0; i < items.length; i++) {
      const a = items[i];
      itemCounts.set(a, (itemCounts.get(a) || 0) + 1);

      for (let j = i + 1; j < items.length; j++) {
        const b = items[j];
        const key = a < b ? `${a} ::: ${b}` : `${b} ::: ${a}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }
  });

  const rules: AssociationRule[] = [];

  pairCounts.forEach((count, key) => {
    if (count >= minSupportCount) {
      const [itemA, itemB] = key.split(' ::: ');
      const countA = itemCounts.get(itemA) || 1;
      const countB = itemCounts.get(itemB) || 1;

      const support = +(count / totalBaskets).toFixed(4);
      // Confidence: P(B | A) = Count(A & B) / Count(A)
      const confidence = +(count / countA).toFixed(3);
      // Lift: P(A & B) / (P(A) * P(B)) = (count * totalBaskets) / (countA * countB)
      const lift = +((count * totalBaskets) / (countA * countB)).toFixed(2);

      rules.push({
        itemA,
        itemB,
        support,
        confidence,
        lift,
        occurrences: count
      });
    }
  });

  // Sort by lift descending
  return rules.sort((a, b) => b.lift - a.lift).slice(0, 15);
}

/**
 * Monthly Sales Aggregation and 3-Month Forward Forecast.
 */
export function calculateSalesForecast(transactions: RetailTransaction[]): SalesForecastPoint[] {
  const monthMap = new Map<string, number>();

  transactions.forEach((t) => {
    if (!t.Invoice.startsWith('C') && t.Quantity > 0 && t.Price > 0) {
      const date = new Date(t.InvoiceDate);
      if (!isNaN(date.getTime())) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const amount = t.TotalAmount !== undefined ? t.TotalAmount : t.Quantity * t.Price;
        monthMap.set(key, (monthMap.get(key) || 0) + amount);
      }
    }
  });

  const sortedMonths = Array.from(monthMap.keys()).sort();
  if (sortedMonths.length === 0) return [];

  const points: SalesForecastPoint[] = [];

  sortedMonths.forEach((m) => {
    const rev = +(monthMap.get(m) || 0).toFixed(2);
    const [y, mon] = m.split('-');
    const dateObj = new Date(parseInt(y), parseInt(mon) - 1, 1);
    const monthName = dateObj.toLocaleString('en-US', { month: 'short', year: '2-digit' });

    points.push({
      date: m,
      month: monthName,
      actualRevenue: rev,
      isForecast: false
    });
  });

  // Simple linear trend forecasting for next 3 months
  const n = points.length;
  if (n >= 3) {
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += points[i].actualRevenue;
      sumXY += i * points[i].actualRevenue;
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    const intercept = (sumY - slope * sumX) / n;

    const lastDate = new Date(points[n - 1].date + '-01');

    for (let f = 1; f <= 3; f++) {
      const futureX = n - 1 + f;
      const forecastVal = Math.max(500, +(intercept + slope * futureX).toFixed(2));
      const futureDate = new Date(lastDate);
      futureDate.setMonth(futureDate.getMonth() + f);

      const fKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;
      const fName = futureDate.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      points.push({
        date: fKey,
        month: `${fName} (Est)`,
        actualRevenue: 0,
        forecastRevenue: forecastVal,
        lowerConfidence: +(forecastVal * 0.88).toFixed(2),
        upperConfidence: +(forecastVal * 1.14).toFixed(2),
        isForecast: true
      });
    }
  }

  return points;
}

/**
 * Generates transparent, actionable Business Recommendations
 * based on actual customer distribution, churn risks, and cluster metrics.
 */
export function generateBusinessRecommendations(
  clusters: ClusterProfile[],
  customers: CustomerRFM[],
  rules: AssociationRule[]
): BusinessRecommendation[] {
  const recommendations: BusinessRecommendation[] = [];

  const champions = clusters.find((c) => c.name === 'Champions');
  const atRisk = clusters.find((c) => c.name === 'At-Risk Customers');
  const newCust = clusters.find((c) => c.name === 'New Customers');
  const loyal = clusters.find((c) => c.name === 'Loyal Customers');
  const highSpend = clusters.find((c) => c.name === 'High-Spending Customers');

  const highChurnCount = customers.filter((c) => c.churnRisk === 'High').length;
  const repeatCustomerCount = customers.filter((c) => c.frequency > 1).length;
  const repeatRate = customers.length > 0 ? +((repeatCustomerCount / customers.length) * 100).toFixed(1) : 0;

  if (champions) {
    recommendations.push({
      id: 'rec-1',
      title: 'Launch VIP Priority Concierge & Early Collection Access',
      targetSegment: 'Champions',
      impact: 'High',
      effort: 'Low',
      rationale: `Champions represent ${champions.percentage}% of your customer base but generate £${champions.totalSegmentRevenue.toLocaleString()} in revenue with average order frequency of ${champions.avgFrequency}x.`,
      supportingData: `Average order value £${champions.avgAOV} with very recent activity (${champions.avgRecency} days ago).`,
      suggestedAction: 'Create an invite-only loyalty tier offering sneak peeks, complimentary priority dispatch, and dedicated account support to protect this core revenue engine.',
      category: 'Loyalty'
    });
  }

  if (atRisk && atRisk.customerCount > 0) {
    recommendations.push({
      id: 'rec-2',
      title: 'Execute Automated Win-Back Campaign with Time-Sensitive Offer',
      targetSegment: 'At-Risk Customers',
      impact: 'High',
      effort: 'Medium',
      rationale: `${atRisk.customerCount} customers have not purchased in ~${atRisk.avgRecency} days despite having made an average of ${atRisk.avgFrequency} previous orders.`,
      supportingData: `Total historical spend at stake: £${atRisk.totalSegmentRevenue.toLocaleString()}. 30-day purchase probability is dropping rapidly.`,
      suggestedAction: 'Dispatch personalized "We miss you" email campaigns featuring a 15% comeback incentive valid for 7 days on their most-purchased product categories.',
      category: 'Re-Engagement'
    });
  }

  if (rules.length > 0) {
    const topRule = rules[0];
    recommendations.push({
      id: 'rec-3',
      title: `Bundle "${topRule.itemA}" with "${topRule.itemB}"`,
      targetSegment: 'All Shoppers',
      impact: 'Medium',
      effort: 'Low',
      rationale: `Market basket analysis uncovered a strong association lift of ${topRule.lift}x with ${topRule.confidence * 100}% purchase confidence.`,
      supportingData: `Co-purchased ${topRule.occurrences} times across recent transaction receipts.`,
      suggestedAction: 'Offer a "Frequently Bought Together" 1-click bundle discount at cart checkout to boost Average Order Value (AOV).',
      category: 'Cross-Sell'
    });
  }

  if (newCust && newCust.customerCount > 0) {
    recommendations.push({
      id: 'rec-4',
      title: 'Implement 14-Day Post-Purchase Nurture Automation',
      targetSegment: 'New Customers',
      impact: 'High',
      effort: 'Medium',
      rationale: `New shoppers (${newCust.customerCount} accounts) have an average purchase count of only ${newCust.avgFrequency}. Transitioning 20% to second orders dramatically increases lifetime value.`,
      supportingData: `Current repeat customer rate across entire database is ${repeatRate}%.`,
      suggestedAction: 'Send a post-delivery satisfaction check-in on day 7, followed by a personalized product recommendation with free shipping on day 14.',
      category: 'Retention'
    });
  }

  if (highSpend && highSpend.customerCount > 0) {
    recommendations.push({
      id: 'rec-5',
      title: 'Curate Bulk-Order & Wholesale Incentives for High Spenders',
      targetSegment: 'High-Spending Customers',
      impact: 'Medium',
      effort: 'Low',
      rationale: `High-spending accounts place large ticket orders (AOV £${highSpend.avgAOV}) but purchase intermittently (every ~${highSpend.avgRecency} days).`,
      supportingData: `Account basket size is ~${(highSpend.avgAOV / 15).toFixed(1)}x higher than standard shop visitors.`,
      suggestedAction: 'Offer tiered volume discounts and commercial invoicing options to encourage bulk reordering.',
      category: 'Revenue'
    });
  }

  return recommendations;
}
