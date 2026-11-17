import React, { useState, useMemo } from 'react';
import {
  Users,
  Sparkles,
  Search,
  Download,
  RotateCcw,
  Sliders,
  TrendingUp,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import * as XLSX from 'xlsx';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { CustomerGrade, CustomerRFM } from '../../types';
import { getCustomerGradeDistribution } from '../../ml/customerGrading';

export const SegmentationPage: React.FC = () => {
  const {
    customers,
    customerGradeThresholds,
    kMeansMetrics,
    reTrainKMeans,
    updateCustomerGradePercentiles,
    isProcessing,
    selectedK
  } = useData();
  const { isExpertMode } = useTheme();

  const [activeSegmentFilter, setActiveSegmentFilter] = useState<string>('All');
  const [activeGradeFilter, setActiveGradeFilter] = useState<CustomerGrade | 'All'>('All');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [kChoice, setKChoice] = useState<number>(selectedK);
  const [sortField, setSortField] = useState<'recency' | 'frequency' | 'monetary'>('monetary');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  const clusters = kMeansMetrics?.clusters || [];
  const gradeDistribution = useMemo(
    () => getCustomerGradeDistribution(customers),
    [customers]
  );

  // Filter & sort customer records
  const filteredCustomers = useMemo(() => {
    let list = [...customers];

    if (activeSegmentFilter !== 'All') {
      list = list.filter((c) => c.segmentName === activeSegmentFilter);
    }

    if (activeGradeFilter !== 'All') {
      list = list.filter((c) => c.grade === activeGradeFilter);
    }

    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      list = list.filter((c) => c.customerId.toLowerCase().includes(q));
    }

    list.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [customers, activeSegmentFilter, activeGradeFilter, customerSearch, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  const handleApplyK = () => {
    if (kChoice !== selectedK) {
      reTrainKMeans(kChoice);
      setCurrentPage(1);
    }
  };

  const handleExportCSV = () => {
    const headers = ['CustomerID', 'Recency_Days', 'Frequency_Orders', 'Monetary_GBP', 'AvgOrderValue_GBP', 'Segment', 'ClusterID'];
    const rows = filteredCustomers.map((c) => [
      c.customerId,
      c.recency,
      c.frequency,
      c.monetary,
      c.avgOrderValue,
      `"${c.segmentName || ''}"`,
      c.clusterId ?? 0
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RetailIQ_Customer_Segments_${Date.now()}.csv`;
    link.click();
  };

  const getGradeReportRows = () =>
    filteredCustomers.map((customer) => ({
      'Customer ID': customer.customerId,
      'Total Orders': customer.frequency,
      'Total Spending (£)': customer.monetary,
      'Last Purchase Date': customer.lastPurchaseDate,
      'Assigned Grade': customer.grade || ''
    }));

  const handleExportGradeCSV = () => {
    const headers = ['Customer ID', 'Total Orders', 'Total Spending (£)', 'Last Purchase Date', 'Assigned Grade'];
    const rows = getGradeReportRows().map((row) => [
      row['Customer ID'],
      row['Total Orders'],
      row['Total Spending (£)'],
      row['Last Purchase Date'],
      row['Assigned Grade']
    ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `RetailIQ_Customer_Grades_${Date.now()}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportGradeExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(getGradeReportRows());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Grades');
    XLSX.writeFile(workbook, `RetailIQ_Customer_Grades_${Date.now()}.xlsx`);
  };

  // 2D Scatter Chart Data: Recency vs Monetary
  const scatterData = useMemo(() => {
    return customers.map((c) => ({
      x: c.recency,
      y: c.monetary,
      z: c.frequency,
      name: c.customerId,
      segment: c.segmentName,
      color: clusters.find((p) => p.name === c.segmentName)?.color || '#16A34A'
    }));
  }, [customers, clusters]);

  return (
    <div className="space-y-6">
      {/* Page Title & Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Customer Segmentation (K-Means Clustering)
            </h1>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              RFM Model
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Segmented using Recency, Frequency, and Monetary attributes with StandardScaler normalization
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-lg hover:bg-neutral-50 dark:hover:bg-[#1B2921] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Segments (CSV)</span>
          </button>
          <button
            onClick={handleExportGradeCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-lg hover:bg-neutral-50 dark:hover:bg-[#1B2921] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Grade Report (CSV)</span>
          </button>
          <button
            onClick={handleExportGradeExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-lg hover:bg-neutral-50 dark:hover:bg-[#1B2921] transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Grade Report (Excel)</span>
          </button>
        </div>
      </div>

      {/* Expert Mode Hyperparameter Tuning Toolbar */}
      {isExpertMode && (
        <div className="p-4 bg-sky-50/50 dark:bg-[#0E202B]/40 border border-sky-200 dark:border-sky-900 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  K-Means Hyperparameter Tuning
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-2">
                  (Current Inertia: <span className="font-mono">{kMeansMetrics?.inertia}</span> · Silhouette:{' '}
                  <span className="font-mono">{kMeansMetrics?.silhouetteScore}</span>)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <label className="text-neutral-600 dark:text-neutral-300 font-medium">
                  Clusters (K):
                </label>
                <select
                  value={kChoice}
                  onChange={(e) => setKChoice(parseInt(e.target.value))}
                  className="px-2.5 py-1 text-xs bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md font-mono"
                >
                  {[3, 4, 5, 6, 7].map((num) => (
                    <option key={num} value={num}>
                      K = {num}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleApplyK}
                disabled={isProcessing || kChoice === selectedK}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-md transition-colors"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Re-fit K-Means</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dataset-driven F1/F2/F3 customer grades */}
      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            F1, F2, F3 Customer Grading
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Grades are recalculated from RFM percentile ranks for the active dataset. Select a grade to filter the customer table.
          </p>
          {customerGradeThresholds && (
            <>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              Using {Math.round(customerGradeThresholds.lowerPercentile * 100)}% /
              {Math.round(customerGradeThresholds.upperPercentile * 100)}% percentile ranks.
              Current data cutoffs: recent purchase ≤ {customerGradeThresholds.recentPurchaseMaxDays.toFixed(1)} days;
              high frequency ≥ {customerGradeThresholds.highFrequencyMinOrders.toFixed(1)} orders;
              high spend ≥ £{customerGradeThresholds.highSpendingMin.toFixed(2)}.
              Low activity: recency ≥ {customerGradeThresholds.longInactivityMinDays.toFixed(1)} days,
              frequency ≤ {customerGradeThresholds.lowFrequencyMaxOrders.toFixed(1)} orders, or
              spending ≤ £{customerGradeThresholds.lowSpendingMax.toFixed(2)}.
            </p>
            <label className="inline-flex items-center gap-2 mt-2 text-[11px] text-neutral-600 dark:text-neutral-300">
              Percentile band
              <select
                value={Math.round(customerGradeThresholds.lowerPercentile * 100)}
                onChange={(event) => {
                  const lowerPercentile = Number(event.target.value) / 100;
                  updateCustomerGradePercentiles(lowerPercentile, 1 - lowerPercentile);
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md text-xs"
              >
                <option value={20}>20th / 80th</option>
                <option value={25}>25th / 75th</option>
                <option value={33}>33rd / 67th</option>
                <option value={40}>40th / 60th</option>
              </select>
            </label>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {gradeDistribution.map((item) => (
            <button
              key={item.grade}
              type="button"
              onClick={() => {
                setActiveGradeFilter(activeGradeFilter === item.grade ? 'All' : item.grade);
                setCurrentPage(1);
              }}
              aria-pressed={activeGradeFilter === item.grade}
              className={`p-4 text-left bg-white dark:bg-[#121B16] border rounded-xl shadow-xs transition-all ${
                activeGradeFilter === item.grade
                  ? 'ring-2 ring-[#16A34A] border-transparent'
                  : 'border-neutral-200/80 dark:border-[#1E2922] hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  {item.grade} · {item.label}
                </span>
                <span className="text-[11px] font-mono text-neutral-500">{item.percentage}%</span>
              </div>
              <div className="mt-2 text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-50">
                {item.count.toLocaleString()}
              </div>
              <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">{item.description}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">Grade Distribution</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">Select a slice to filter customers</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    dataKey="count"
                    nameKey="grade"
                    innerRadius={55}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {gradeDistribution.map((item) => (
                      <Cell
                        key={item.grade}
                        fill={item.color}
                        cursor="pointer"
                        onClick={() => {
                          setActiveGradeFilter(item.grade);
                          setCurrentPage(1);
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | string | readonly (number | string)[] | undefined, name: string | number | undefined) =>
                      [`${Number(value)} customers`, String(name)]}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">Customers by Grade</h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">Select a bar to filter customers</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="grade" stroke="#94A3B8" fontSize={11} />
                  <YAxis allowDecimals={false} stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    formatter={(value: number | string | readonly (number | string)[] | undefined) =>
                      [`${Number(value)} customers`, 'Customers']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                    {gradeDistribution.map((item) => (
                      <Cell
                        key={item.grade}
                        fill={item.color}
                        cursor="pointer"
                        onClick={() => {
                          setActiveGradeFilter(item.grade);
                          setCurrentPage(1);
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Cluster Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {clusters.map((profile) => (
          <div
            key={profile.id}
            onClick={() =>
              setActiveSegmentFilter(
                activeSegmentFilter === profile.name ? 'All' : profile.name
              )
            }
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              activeSegmentFilter === profile.name
                ? 'bg-neutral-50 dark:bg-[#15231C] ring-2 ring-[#16A34A] border-transparent shadow-sm'
                : 'bg-white dark:bg-[#121B16] border-neutral-200/80 dark:border-[#1E2922] hover:border-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: profile.color }} />
                <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">
                  {profile.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                {profile.percentage}%
              </span>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed mb-3">
              {profile.description}
            </p>

            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center font-mono">
              <div className="p-1 bg-neutral-50 dark:bg-[#0E1612] rounded">
                <div className="text-[9px] text-neutral-400 uppercase">Recency</div>
                <div className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                  {profile.avgRecency}d
                </div>
              </div>
              <div className="p-1 bg-neutral-50 dark:bg-[#0E1612] rounded">
                <div className="text-[9px] text-neutral-400 uppercase">Freq</div>
                <div className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                  {profile.avgFrequency}x
                </div>
              </div>
              <div className="p-1 bg-neutral-50 dark:bg-[#0E1612] rounded">
                <div className="text-[9px] text-neutral-400 uppercase">Monetary</div>
                <div className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                  £{profile.avgMonetary.toFixed(0)}
                </div>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 p-2 rounded-lg">
              <span className="font-semibold">Action: </span>
              {profile.strategy}
            </div>
          </div>
        ))}
      </div>

      {/* Expert Mode Centroids & 2D Cluster Space */}
      {isExpertMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 2D RFM Scatter Projection */}
          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Customer RFM Feature Space (Recency vs Monetary)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Visualizes customer distributions across recency days (X-axis) and lifetime spend (Y-axis)
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="Recency (Days)"
                    stroke="#94A3B8"
                    fontSize={11}
                    unit="d"
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Monetary (£)"
                    stroke="#94A3B8"
                    fontSize={11}
                    unit="£"
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="p-2 bg-[#0F172A] text-white text-xs rounded shadow-lg border border-neutral-700">
                          <div className="font-bold text-emerald-400">Customer #{data.name}</div>
                          <div>Segment: {data.segment}</div>
                          <div>Recency: {data.x} days</div>
                          <div>Monetary: £{Number(data.y).toLocaleString()}</div>
                          <div>Frequency: {data.z} orders</div>
                        </div>
                      );
                    }}
                  />
                  <Scatter name="Customers" data={scatterData}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.75} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cluster Centroids Coordinates Table */}
          <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs overflow-x-auto">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              Cluster Centroid Averages & Revenue Contribution
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Mathematical centers of mass derived after K-Means convergence
            </p>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px]">
                  <th className="py-2">Segment</th>
                  <th className="py-2 text-right">Avg Recency</th>
                  <th className="py-2 text-right">Avg Freq</th>
                  <th className="py-2 text-right">Avg Monetary</th>
                  <th className="py-2 text-right">Avg AOV</th>
                  <th className="py-2 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
                {clusters.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-[#17221C]">
                    <td className="py-2.5 font-sans font-medium flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-neutral-900 dark:text-neutral-100">{c.name}</span>
                    </td>
                    <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">{c.avgRecency} days</td>
                    <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">{c.avgFrequency}</td>
                    <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">£{c.avgMonetary.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">£{c.avgAOV.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-bold text-neutral-900 dark:text-neutral-100">
                      £{c.totalSegmentRevenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Level Searchable RFM Table */}
      <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Customer RFM and Grade Records
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Showing {filteredCustomers.length} customers (Grade:{' '}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{activeGradeFilter}</span>; Segment:{' '}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{activeSegmentFilter}</span>)
            </p>
          </div>

          <div className="flex items-center gap-2">
          <select
            value={activeGradeFilter}
            onChange={(e) => {
              setActiveGradeFilter(e.target.value as CustomerGrade | 'All');
              setCurrentPage(1);
            }}
            aria-label="Filter customers by grade"
            className="px-2.5 py-1 text-xs bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md text-neutral-700 dark:text-neutral-200"
          >
            <option value="All">All grades</option>
            <option value="F1">F1 · Regular</option>
            <option value="F2">F2 · Medium</option>
            <option value="F3">F3 · Low Activity</option>
          </select>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Filter Customer ID..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1 text-xs bg-neutral-50 dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>

            {(activeSegmentFilter !== 'All' || activeGradeFilter !== 'All') && (
              <button
                onClick={() => {
                  setActiveSegmentFilter('All');
                  setActiveGradeFilter('All');
                  setCurrentPage(1);
                }}
                className="text-xs text-[#16A34A] underline px-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-[10px] uppercase font-semibold">
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Last Purchase</th>
                <th className="py-2.5 px-3">Grade</th>
                <th
                  onClick={() => {
                    setSortField('recency');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Recency</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('frequency');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Orders</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('monetary');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-neutral-800 dark:hover:text-neutral-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Spending (£)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Avg Order (£)</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3">Segment Assignment</th>
                <th className="py-2.5 px-3 text-right">Churn Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
              {paginatedCustomers.map((c) => {
                const seg = clusters.find((p) => p.name === c.segmentName);
                return (
                  <tr key={c.customerId} className="hover:bg-neutral-50 dark:hover:bg-[#16221B]">
                    <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                      #{c.customerId}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300">
                      {c.lastPurchaseDate}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        c.grade === 'F1'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                          : c.grade === 'F2'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                      }`}>
                        {c.grade || '—'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-700 dark:text-neutral-300">
                      {c.recency} days
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-700 dark:text-neutral-300">
                      {c.frequency.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-neutral-900 dark:text-neutral-100">
                      £{c.monetary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right text-neutral-600 dark:text-neutral-400">
                      £{c.avgOrderValue.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-neutral-600 dark:text-neutral-300">
                      {c.country}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{
                          backgroundColor: `${seg?.color}15`,
                          color: seg?.color || '#16A34A'
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg?.color }} />
                        {c.segmentName}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-sans">
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          c.churnRisk === 'High'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                            : c.churnRisk === 'Medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        }`}
                      >
                        {c.churnRisk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="text-neutral-500 dark:text-neutral-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
