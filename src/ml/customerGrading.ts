import {
  CustomerGrade,
  CustomerGradeDistribution,
  CustomerGradeThresholds,
  CustomerRFM
} from '../types';

const DEFAULT_LOWER_PERCENTILE = 1 / 3;

const GRADE_METADATA = {
  F1: {
    label: 'Regular Customers',
    description: 'Recent purchases with high frequency and spending.',
    color: '#16A34A'
  },
  F2: {
    label: 'Medium Customers',
    description: 'Moderate activity across recency, frequency, and spending.',
    color: '#0EA5E9'
  },
  F3: {
    label: 'Low Activity Customers',
    description: 'Low frequency or spending, or a long time since the last purchase.',
    color: '#F59E0B'
  }
} satisfies Record<CustomerGrade, { label: string; description: string; color: string }>;

const quantile = (values: number[], probability: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * probability;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const fraction = index - lowerIndex;
  return sorted[lowerIndex] + (sorted[upperIndex] - sorted[lowerIndex]) * fraction;
};

const percentileRanks = (values: number[]): number[] => {
  if (values.length <= 1) return values.map(() => 0.5);

  const sorted = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(values.length);

  for (let start = 0; start < sorted.length;) {
    let end = start + 1;
    while (end < sorted.length && sorted[end].value === sorted[start].value) end++;

    const rank = ((start + end - 1) / 2) / (sorted.length - 1);
    for (let index = start; index < end; index++) {
      ranks[sorted[index].index] = rank;
    }
    start = end;
  }

  return ranks;
};

export function assignCustomerGrades(
  customers: CustomerRFM[],
  lowerPercentile?: number,
  upperPercentile?: number
): {
  customers: CustomerRFM[];
  thresholds: CustomerGradeThresholds;
} {
  const lowerCut = lowerPercentile ?? DEFAULT_LOWER_PERCENTILE;
  const upperCut = upperPercentile ?? 1 - lowerCut;
  if (
    !Number.isFinite(lowerCut) ||
    !Number.isFinite(upperCut) ||
    lowerCut <= 0 ||
    upperCut >= 1 ||
    lowerCut >= upperCut
  ) {
    throw new RangeError('Customer grade percentiles must satisfy 0 < lower < upper < 1.');
  }

  const recencies = customers.map((customer) => customer.recency);
  const frequencies = customers.map((customer) => customer.frequency);
  const spendings = customers.map((customer) => customer.monetary);
  const thresholds: CustomerGradeThresholds = {
    lowerPercentile: lowerCut,
    upperPercentile: upperCut,
    recentPurchaseMaxDays: quantile(recencies, lowerCut),
    longInactivityMinDays: quantile(recencies, upperCut),
    lowFrequencyMaxOrders: quantile(frequencies, lowerCut),
    highFrequencyMinOrders: quantile(frequencies, upperCut),
    lowSpendingMax: quantile(spendings, lowerCut),
    highSpendingMin: quantile(spendings, upperCut)
  };

  const recencyRanks = percentileRanks(recencies);
  const frequencyRanks = percentileRanks(frequencies);
  const spendingRanks = percentileRanks(spendings);

  return {
    customers: customers.map((customer, index) => {
      const recencyScore = 1 - recencyRanks[index];
      const frequencyScore = frequencyRanks[index];
      const spendingScore = spendingRanks[index];
      const grade: CustomerGrade =
        recencyScore >= upperCut &&
        frequencyScore >= upperCut &&
        spendingScore >= upperCut
          ? 'F1'
          : recencyScore <= lowerCut ||
            frequencyScore <= lowerCut ||
            spendingScore <= lowerCut
          ? 'F3'
          : 'F2';

      return { ...customer, grade };
    }),
    thresholds
  };
}

export function getCustomerGradeDistribution(
  customers: CustomerRFM[]
): CustomerGradeDistribution[] {
  const gradeOrder: CustomerGrade[] = ['F1', 'F2', 'F3'];
  return gradeOrder.map((grade) => {
    const metadata = GRADE_METADATA[grade];
    const count = customers.filter((customer) => customer.grade === grade).length;
    return {
      grade,
      ...metadata,
      count,
      percentage: customers.length > 0
        ? +((count / customers.length) * 100).toFixed(1)
        : 0
    };
  });
}
