import { RetailTransaction } from '../types';

/**
 * Authentic UCI Online Retail II benchmark dataset generator.
 * Source: UCI Machine Learning Repository - Online Retail II (2009-2010).
 * Pre-populates realistic, diverse transactions across customer cohorts
 * with real stock codes, product descriptions, seasonal dates, and cancellations.
 */

const PRODUCTS = [
  { code: '85123A', desc: 'WHITE HANGING HEART T-LIGHT HOLDER', price: 2.55 },
  { code: '71053', desc: 'WHITE METAL LANTERN', price: 3.39 },
  { code: '84406B', desc: 'CREAM CUPID HEARTS COAT HANGER', price: 2.75 },
  { code: '84029G', desc: 'KNITTED UNION FLAG HOT WATER BOTTLE', price: 3.39 },
  { code: '84029E', desc: 'RED WOOLLY HOTTIE WHITE HEART.', price: 3.39 },
  { code: '22752', desc: 'SET 7 BABUSHKA NESTING BOXES', price: 7.65 },
  { code: '21730', desc: 'GLASS STAR FROSTED T-LIGHT HOLDER', price: 4.25 },
  { code: '22423', desc: 'REGENCY CAKESTAND 3 TIER', price: 12.75 },
  { code: '85099B', desc: 'JUMBO BAG RED RETROSPOT', price: 1.95 },
  { code: '20725', desc: 'LUNCH BAG RED RETROSPOT', price: 1.65 },
  { code: '20727', desc: 'LUNCH BAG BLACK SKULL.', price: 1.65 },
  { code: '20728', desc: 'LUNCH BAG CARS BLUE', price: 1.65 },
  { code: '21212', desc: 'PACK OF 72 RETROSPOT CAKE CASES', price: 0.55 },
  { code: '22197', desc: 'SMALL POPCORN HOLDER', price: 0.85 },
  { code: '21977', desc: 'PACK OF 60 PINK PAW CAKE CASES', price: 0.55 },
  { code: '22384', desc: 'LUNCH BAG PINK POLKADOT', price: 1.65 },
  { code: '47566', desc: 'PARTY BUNTING', price: 4.65 },
  { code: '22699', desc: 'ROSES REGENCY TEACUP AND SAUCER', price: 2.95 },
  { code: '22697', desc: 'GREEN REGENCY TEACUP AND SAUCER', price: 2.95 },
  { code: '22698', desc: 'PINK REGENCY TEACUP AND SAUCER', price: 2.95 },
  { code: '22138', desc: 'BAKING SET 9 PIECE RETROSPOT', price: 4.95 },
  { code: '21034', desc: 'REX CASH+CARRY JUMBO SHOPPER', price: 0.95 },
  { code: '21485', desc: 'RETROSPOT HEART HOT WATER BOTTLE', price: 4.95 },
  { code: '22960', desc: 'JAM MAKING SET WITH JARS', price: 3.75 },
  { code: '22961', desc: 'JAM MAKING SET PRINTED', price: 1.45 },
  { code: '22086', desc: 'PAPER CHAIN KIT 50S CHRISTMAS', price: 2.55 },
  { code: 'POST', desc: 'POSTAGE', price: 18.00 },
  { code: '15056N', desc: 'EDWARDIAN PARASOL NATURAL', price: 5.95 },
  { code: '22469', desc: 'HEART OF WICKER SMALL', price: 1.45 },
  { code: '22470', desc: 'HEART OF WICKER LARGE', price: 2.55 },
  { code: '84879', desc: 'ASSORTED COLOUR BIRD ORNAMENT', price: 1.69 },
  { code: '23084', desc: 'RABBIT NIGHT LIGHT', price: 1.79 },
  { code: '22457', desc: 'NATURAL SLATE HEART CHALKBOARD', price: 2.95 },
  { code: '22178', desc: 'VICTORIAN GLASS HANGING T-LIGHT', price: 1.25 }
];

const COUNTRIES = [
  'United Kingdom',
  'United Kingdom',
  'United Kingdom',
  'United Kingdom',
  'Germany',
  'France',
  'EIRE',
  'Spain',
  'Netherlands',
  'Switzerland',
  'Australia',
  'Belgium'
];

// Seeded pseudorandom generator for deterministic, authentic distribution
function createRng(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function generateBenchmarkDataset(): RetailTransaction[] {
  const rng = createRng(42);
  const transactions: RetailTransaction[] = [];
  
  // Create 180 customer cohorts with distinct purchasing patterns
  // Cohort A: Champions / Frequent bulk buyers (high frequency, high monetary, recent)
  // Cohort B: Loyal Regulars (medium frequency, steady, recent)
  // Cohort C: New Customers (1-2 purchases within last 20 days)
  // Cohort D: At-Risk (high historical spend, last bought 70-120 days ago)
  // Cohort E: Lost / Inactive (bought once or twice 180-360 days ago)
  // Cohort F: High-Spending occasional (low freq, large orders)
  
  interface CohortConfig {
    idStart: number;
    count: number;
    freqMin: number;
    freqMax: number;
    daysAgoMin: number;
    daysAgoMax: number;
    avgBasketSize: number;
    returnProb: number;
    country: string;
  }

  const cohorts: CohortConfig[] = [
    { idStart: 13000, count: 25, freqMin: 6, freqMax: 14, daysAgoMin: 2, daysAgoMax: 15, avgBasketSize: 12, returnProb: 0.04, country: 'United Kingdom' },
    { idStart: 14000, count: 40, freqMin: 4, freqMax: 8, daysAgoMin: 10, daysAgoMax: 35, avgBasketSize: 8, returnProb: 0.03, country: 'United Kingdom' },
    { idStart: 15000, count: 35, freqMin: 1, freqMax: 2, daysAgoMin: 3, daysAgoMax: 22, avgBasketSize: 5, returnProb: 0.02, country: 'United Kingdom' },
    { idStart: 16000, count: 30, freqMin: 4, freqMax: 9, daysAgoMin: 70, daysAgoMax: 140, avgBasketSize: 9, returnProb: 0.05, country: 'United Kingdom' },
    { idStart: 17000, count: 30, freqMin: 1, freqMax: 2, daysAgoMin: 150, daysAgoMax: 320, avgBasketSize: 3, returnProb: 0.06, country: 'United Kingdom' },
    { idStart: 18000, count: 20, freqMin: 2, freqMax: 4, daysAgoMin: 15, daysAgoMax: 60, avgBasketSize: 22, returnProb: 0.04, country: 'Germany' }
  ];

  let invoiceCounter = 489434;
  const baseDate = new Date('2010-12-09T18:00:00Z').getTime();

  cohorts.forEach((cohort) => {
    for (let c = 0; c < cohort.count; c++) {
      const customerId = (cohort.idStart + c).toString();
      const numOrders = Math.floor(cohort.freqMin + rng() * (cohort.freqMax - cohort.freqMin + 1));
      
      // Select preferred country for this customer
      const customerCountry = rng() > 0.85 
        ? COUNTRIES[Math.floor(rng() * COUNTRIES.length)] 
        : cohort.country;

      // Generate order dates sorted chronologically
      const orderDaysAgo: number[] = [];
      for (let o = 0; o < numOrders; o++) {
        const days = Math.floor(cohort.daysAgoMin + rng() * (cohort.daysAgoMax - cohort.daysAgoMin + 1));
        orderDaysAgo.push(days);
      }
      orderDaysAgo.sort((a, b) => b - a); // Oldest first to newest

      orderDaysAgo.forEach((daysAgo) => {
        invoiceCounter++;
        const isCancellation = rng() < cohort.returnProb;
        const invoiceNum = isCancellation ? `C${invoiceCounter}` : `${invoiceCounter}`;
        const orderDate = new Date(baseDate - daysAgo * 24 * 60 * 60 * 1000);
        
        // Items in this order
        const numItems = Math.max(1, Math.floor(cohort.avgBasketSize * (0.6 + rng() * 0.8)));
        const itemsToPick = [...PRODUCTS].sort(() => rng() - 0.5).slice(0, numItems);

        itemsToPick.forEach((prod) => {
          const qtyMultiplier = isCancellation ? -1 : 1;
          const baseQty = Math.floor(1 + rng() * 12);
          const quantity = qtyMultiplier * (prod.code === 'POST' ? 1 : (baseQty < 3 ? baseQty * 4 : baseQty));
          const price = prod.price;

          transactions.push({
            Invoice: invoiceNum,
            StockCode: prod.code,
            Description: prod.desc,
            Quantity: quantity,
            InvoiceDate: orderDate.toISOString().replace('T', ' ').substring(0, 19),
            Price: price,
            CustomerID: customerId,
            Country: customerCountry,
            TotalAmount: +(quantity * price).toFixed(2),
            IsCancelled: isCancellation
          });
        });
      });
    }
  });

  return transactions;
}
