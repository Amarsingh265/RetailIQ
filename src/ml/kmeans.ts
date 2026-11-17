import { CustomerRFM, ClusterProfile, KMeansMetrics } from '../types';
import { preprocessRFMForClustering } from './rfm';

// Euclidean distance squared between two vectors
function distSq(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

function dist(a: number[], b: number[]): number {
  return Math.sqrt(distSq(a, b));
}

// Seeded K-Means++ initialization
function initCentroidsKMeansPlusPlus(data: number[][], k: number, seed: number): number[][] {
  const n = data.length;
  const centroids: number[][] = [];
  
  // Choose first centroid randomly
  let currentSeed = seed;
  const rand = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  const firstIdx = Math.floor(rand() * n);
  centroids.push([...data[firstIdx]]);

  // Distances to closest centroid
  const dSq = new Array(n).fill(Infinity);

  for (let c = 1; c < k; c++) {
    let totalDSq = 0;
    const latestCentroid = centroids[c - 1];

    for (let i = 0; i < n; i++) {
      const d = distSq(data[i], latestCentroid);
      if (d < dSq[i]) dSq[i] = d;
      totalDSq += dSq[i];
    }

    // Roulette wheel selection proportional to D^2
    const target = rand() * totalDSq;
    let accum = 0;
    let chosenIdx = 0;
    for (let i = 0; i < n; i++) {
      accum += dSq[i];
      if (accum >= target) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push([...data[chosenIdx]]);
  }

  return centroids;
}

// Core K-Means runner
export function runKMeans(
  data: number[][],
  k: number,
  maxIterations: number = 60,
  seed: number = 42
): {
  centroids: number[][];
  assignments: number[];
  inertia: number;
} {
  const n = data.length;
  const dim = data[0]?.length || 0;
  if (n === 0 || k <= 0 || dim === 0) {
    return { centroids: [], assignments: [], inertia: 0 };
  }

  const kClamped = Math.min(k, n);
  let centroids = initCentroidsKMeansPlusPlus(data, kClamped, seed);
  let assignments = new Array(n).fill(0);
  let inertia = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    inertia = 0;

    // Assignment step
    for (let i = 0; i < n; i++) {
      let bestDist = Infinity;
      let bestCluster = 0;
      for (let c = 0; c < kClamped; c++) {
        const d = distSq(data[i], centroids[c]);
        if (d < bestDist) {
          bestDist = d;
          bestCluster = c;
        }
      }
      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        changed = true;
      }
      inertia += bestDist;
    }

    if (!changed && iter > 0) break;

    // Update step
    const newCentroids = Array.from({ length: kClamped }, () => new Array(dim).fill(0));
    const counts = new Array(kClamped).fill(0);

    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let d = 0; d < dim; d++) {
        newCentroids[c][d] += data[i][d];
      }
    }

    for (let c = 0; c < kClamped; c++) {
      if (counts[c] > 0) {
        for (let d = 0; d < dim; d++) {
          newCentroids[c][d] /= counts[c];
        }
      } else {
        // Handle empty cluster: re-assign to random data point
        const randIdx = (i: number) => (i * 37) % n;
        newCentroids[c] = [...data[randIdx(c)]];
      }
    }

    centroids = newCentroids;
  }

  return { centroids, assignments, inertia };
}

// Compute Silhouette score for clustering
export function calculateSilhouetteScore(
  data: number[][],
  assignments: number[],
  k: number
): number {
  const n = data.length;
  if (n <= k || k <= 1) return 0;

  // Subsample if large to keep calculation responsive (< 500 samples)
  const step = Math.max(1, Math.floor(n / 400));
  const sampleIndices: number[] = [];
  for (let i = 0; i < n; i += step) sampleIndices.push(i);
  const sampleSize = sampleIndices.length;

  let totalSilhouette = 0;

  for (let s = 0; s < sampleSize; s++) {
    const i = sampleIndices[s];
    const clusterI = assignments[i];

    // Compute a(i): average distance to points in same cluster
    let sameClusterDistSum = 0;
    let sameClusterCount = 0;

    // Compute distances to other clusters
    const otherClusterDistSums = new Array(k).fill(0);
    const otherClusterCounts = new Array(k).fill(0);

    for (let os = 0; os < sampleSize; os++) {
      const j = sampleIndices[os];
      if (i === j) continue;
      const d = dist(data[i], data[j]);
      const clusterJ = assignments[j];

      if (clusterJ === clusterI) {
        sameClusterDistSum += d;
        sameClusterCount++;
      } else {
        otherClusterDistSums[clusterJ] += d;
        otherClusterCounts[clusterJ]++;
      }
    }

    const a_i = sameClusterCount > 0 ? sameClusterDistSum / sameClusterCount : 0;

    let b_i = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === clusterI) continue;
      if (otherClusterCounts[c] > 0) {
        const avgDistToC = otherClusterDistSums[c] / otherClusterCounts[c];
        if (avgDistToC < b_i) b_i = avgDistToC;
      }
    }

    if (b_i === Infinity) b_i = 0;

    const s_i = Math.max(a_i, b_i) > 0 ? (b_i - a_i) / Math.max(a_i, b_i) : 0;
    totalSilhouette += s_i;
  }

  return +(totalSilhouette / sampleSize).toFixed(4);
}

const SEGMENT_PALETTE = [
  '#16A34A', // Emerald
  '#0284C7', // Sky Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1'  // Indigo
];

/**
 * Assigns natural business segment names dynamically based on the actual
 * centroid characteristics (Recency, Frequency, Monetary).
 * Does NOT hardcode by cluster index!
 */
export function interpretClusterProfiles(
  customers: CustomerRFM[],
  assignments: number[],
  k: number
): { profiles: ClusterProfile[]; updatedCustomers: CustomerRFM[] } {
  const clusterGroups: CustomerRFM[][] = Array.from({ length: k }, () => []);

  customers.forEach((c, idx) => {
    const cluster = assignments[idx];
    if (clusterGroups[cluster]) {
      clusterGroups[cluster].push(c);
    }
  });

  // Calculate raw centroid statistics for each cluster
  const rawStats = clusterGroups.map((group, clusterId) => {
    const count = group.length;
    if (count === 0) {
      return {
        id: clusterId,
        count: 0,
        avgR: 0,
        avgF: 0,
        avgM: 0,
        avgAOV: 0,
        totalRev: 0
      };
    }
    const avgR = group.reduce((s, c) => s + c.recency, 0) / count;
    const avgF = group.reduce((s, c) => s + c.frequency, 0) / count;
    const avgM = group.reduce((s, c) => s + c.monetary, 0) / count;
    const avgAOV = group.reduce((s, c) => s + c.avgOrderValue, 0) / count;
    const totalRev = group.reduce((s, c) => s + c.monetary, 0);

    return {
      id: clusterId,
      count,
      avgR,
      avgF,
      avgM,
      avgAOV,
      totalRev
    };
  });

  // Rank clusters based on characteristics to dynamically assign segment names
  // Find global min and max
  const maxM = Math.max(...rawStats.map((s) => s.avgM), 1);
  const minR = Math.min(...rawStats.map((s) => s.avgR), 1);
  const maxR = Math.max(...rawStats.map((s) => s.avgR), 1);
  const maxF = Math.max(...rawStats.map((s) => s.avgF), 1);

  // Assign scores: high F + high M - high R (good)
  const scoredClusters = rawStats.map((stat) => {
    // Recency normalized (lower is better, so 1 - normR)
    const normRScore = 1 - (stat.avgR - minR) / (maxR - minR || 1);
    const normFScore = stat.avgF / maxF;
    const normMScore = stat.avgM / maxM;
    const vitalityScore = normRScore * 0.35 + normFScore * 0.35 + normMScore * 0.30;

    return { ...stat, normRScore, normFScore, normMScore, vitalityScore };
  });

  // Sort by vitality to assign labels accurately
  const sortedByVitality = [...scoredClusters].sort((a, b) => b.vitalityScore - a.vitalityScore);

  const clusterMetaMap = new Map<number, { name: string; desc: string; strat: string; color: string }>();

  // Assign distinct business personas based on rank and profile
  sortedByVitality.forEach((item, rank) => {
    let name = 'Regular Customers';
    let desc = 'Customers with steady repeat transactions and moderate basket size.';
    let strat = 'Engage with weekly personalized newsletters and seasonal product arrivals.';
    let color = SEGMENT_PALETTE[rank % SEGMENT_PALETTE.length];

    if (rank === 0 && item.avgM >= maxM * 0.6) {
      name = 'Champions';
      desc = 'Top-tier spenders who buy frequently and have purchased very recently.';
      strat = 'VIP rewards, early access to new collections, and dedicated premium support.';
      color = '#16A34A'; // Emerald
    } else if (item.normRScore > 0.6 && item.avgF >= 4) {
      name = 'Loyal Customers';
      desc = 'Consistent repeat buyers with high brand affinity and regular visits.';
      strat = 'Loyalty points incentives, referral programs, and cross-sell related categories.';
      color = '#0284C7'; // Blue
    } else if (item.normRScore > 0.7 && item.avgF <= 2) {
      name = 'New Customers';
      desc = 'First-time or recent shoppers who made their initial purchase within recent days.';
      strat = 'Welcome sequence, second-order discounts, and onboarding product recommendations.';
      color = '#8B5CF6'; // Purple
    } else if (item.avgM > maxM * 0.5 && item.avgF < 3) {
      name = 'High-Spending Customers';
      desc = 'Customers placing high-value orders with large individual basket sizes.';
      strat = 'High-ticket product bundles, volume discounts, and premium packaging.';
      color = '#F59E0B'; // Amber
    } else if (item.avgR > 75 && item.avgF >= 3) {
      name = 'At-Risk Customers';
      desc = 'Previously active buyers who have not returned in over 70 days.';
      strat = 'Personalized win-back emails, limited-time comeback coupons, and survey feedback.';
      color = '#EF4444'; // Red
    } else if (item.avgR > 120) {
      name = 'Lost Customers';
      desc = 'Inactive customers with no recent transactions and low engagement.';
      strat = 'Low-frequency automated reactivations or aggressive clearance promotions.';
      color = '#64748B'; // Slate
    } else {
      name = 'Potential Loyalists';
      desc = 'Recent shoppers with above-average spend who could transition to loyalists.';
      strat = 'Membership program incentives and cross-category discovery.';
      color = '#14B8A6'; // Teal
    }

    clusterMetaMap.set(item.id, { name, desc, strat, color });
  });

  const totalCustomers = customers.length;
  const profiles: ClusterProfile[] = rawStats.map((stat) => {
    const meta = clusterMetaMap.get(stat.id)!;
    return {
      id: stat.id,
      name: meta.name,
      color: meta.color,
      customerCount: stat.count,
      percentage: totalCustomers > 0 ? +((stat.count / totalCustomers) * 100).toFixed(1) : 0,
      avgRecency: +stat.avgR.toFixed(1),
      avgFrequency: +stat.avgF.toFixed(1),
      avgMonetary: +stat.avgM.toFixed(2),
      avgAOV: +stat.avgAOV.toFixed(2),
      totalSegmentRevenue: +stat.totalRev.toFixed(2),
      description: meta.desc,
      strategy: meta.strat
    };
  });

  // Update customers with assigned cluster, segment name, and color
  const updatedCustomers = customers.map((c, idx) => {
    const clusterId = assignments[idx];
    const profile = profiles.find((p) => p.id === clusterId);
    return {
      ...c,
      clusterId,
      segmentName: profile?.name || `Segment ${clusterId + 1}`,
      segmentDescription: profile?.description || ''
    };
  });

  return { profiles, updatedCustomers };
}

/**
 * End-to-end K-Means pipeline:
 * 1. Preprocesses RFM features (log1p + standard scaling)
 * 2. Computes Elbow curve and Silhouette scores for k = 2..8
 * 3. Fits model at selected k (default 4 or user-selected)
 * 4. Produces dynamic cluster profiles and customer segment assignments
 */
export function trainCustomerSegmentation(
  customers: CustomerRFM[],
  selectedK: number = 4
): {
  metrics: KMeansMetrics;
  updatedCustomers: CustomerRFM[];
} {
  const prep = preprocessRFMForClustering(customers);
  const data = prep.scaledMatrix;

  if (data.length < selectedK || selectedK < 2) {
    return {
      metrics: {
        k: selectedK,
        inertia: 0,
        silhouetteScore: 0,
        elbowPoints: [],
        silhouetteScores: [],
        clusters: [],
        trainedAt: new Date().toISOString(),
        featureNames: prep.featureNames
      },
      updatedCustomers: customers
    };
  }

  // Calculate Elbow and Silhouette for K = 2 to 7
  const elbowPoints: { k: number; inertia: number }[] = [];
  const silhouetteScores: { k: number; score: number }[] = [];

  const maxKToTest = Math.min(7, Math.max(selectedK + 2, data.length - 1));

  let finalCentroids: number[][] = [];
  let finalAssignments: number[] = [];
  let finalInertia = 0;

  for (let testK = 2; testK <= maxKToTest; testK++) {
    const { centroids, assignments, inertia } = runKMeans(data, testK, 45, 42);
    const silScore = calculateSilhouetteScore(data, assignments, testK);

    elbowPoints.push({ k: testK, inertia: +inertia.toFixed(2) });
    silhouetteScores.push({ k: testK, score: silScore });

    if (testK === selectedK) {
      finalCentroids = centroids;
      finalAssignments = assignments;
      finalInertia = inertia;
    }
  }

  // If selectedK wasn't inside the test loop, run it directly
  if (finalAssignments.length === 0) {
    const res = runKMeans(data, selectedK, 50, 42);
    finalCentroids = res.centroids;
    finalAssignments = res.assignments;
    finalInertia = res.inertia;
  }

  const finalSilScore =
    silhouetteScores.find((s) => s.k === selectedK)?.score ||
    calculateSilhouetteScore(data, finalAssignments, selectedK);

  const { profiles, updatedCustomers } = interpretClusterProfiles(
    customers,
    finalAssignments,
    selectedK
  );

  return {
    metrics: {
      k: selectedK,
      inertia: +finalInertia.toFixed(2),
      silhouetteScore: finalSilScore,
      elbowPoints,
      silhouetteScores,
      clusters: profiles,
      trainedAt: new Date().toISOString(),
      featureNames: prep.featureNames
    },
    updatedCustomers
  };
}
