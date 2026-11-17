import React from 'react';
import {
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Target,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const RecommendationsPage: React.FC<{ onNavigateTo: (page: any) => void }> = ({ onNavigateTo }) => {
  const { recommendations, datasetSummary, customers } = useData();

  const impactBadge = (impact: 'High' | 'Medium' | 'Low') => {
    switch (impact) {
      case 'High':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Medium':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300';
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Prescriptive Business Recommendations Engine
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Algorithm Grounded
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Data-backed commercial strategies mapped directly to empirical customer segments and transaction rules
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Generated across {customers.length} customer profiles
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs transition-hover hover:border-neutral-300 dark:hover:border-neutral-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${impactBadge(rec.impact)}`}>
                    {rec.impact} Commercial Impact
                  </span>
                  <span className="text-xs text-neutral-400">·</span>
                  <span className="text-xs font-medium text-[#16A34A]">{rec.category} Strategy</span>
                </div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {rec.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0 font-mono">
                <span className="text-neutral-400">Target Cohort:</span>
                <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#18261F] text-neutral-800 dark:text-neutral-200 font-bold font-sans">
                  {rec.targetSegment}
                </span>
              </div>
            </div>

            {/* Strategic Rationale & Supporting Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
                <div className="font-semibold text-neutral-900 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-sky-500" />
                  <span>Why This Is Recommended:</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                  {rec.rationale}
                </p>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
                <div className="font-semibold text-neutral-900 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Supporting Dataset Information:</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                  {rec.supportingData}
                </p>
              </div>
            </div>

            {/* Suggested Action Bar */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                  Prescribed Action:
                </span>
                <span className="text-neutral-700 dark:text-neutral-300 text-[11px] leading-relaxed">
                  {rec.suggestedAction}
                </span>
              </div>

              <button
                onClick={() => {
                  if (rec.targetSegment.includes('Segment') || rec.targetSegment.includes('Champions') || rec.targetSegment.includes('Loyal')) {
                    onNavigateTo('segmentation');
                  } else if (rec.category === 'Cross-Sell') {
                    onNavigateTo('analytics');
                  } else {
                    onNavigateTo('prediction');
                  }
                }}
                className="flex items-center gap-1 font-semibold text-[#16A34A] hover:underline shrink-0"
              >
                <span>View Audience</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
