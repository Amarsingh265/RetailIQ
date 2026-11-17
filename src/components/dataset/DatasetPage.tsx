import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Download,
  RotateCcw,
  Database,
  Trash2,
  FileCheck,
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const DatasetPage: React.FC = () => {
  const {
    datasetSummary,
    transactions,
    uploadAndCleanDataset,
    resetToBenchmarkDataset,
    exportCleanedCSV,
    isProcessing
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cleaningStatus, setCleaningStatus] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<number>(1);
  const previewPageSize = 8;

  // Process uploaded file (CSV or XLSX)
  const handleFile = (file: File) => {
    setUploadError(null);
    setCleaningStatus(`Parsing file ${file.name}...`);

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: true,
        complete: async (results) => {
          if (results.errors.length > 0 && results.data.length === 0) {
            setUploadError('CSV parsing error: ' + results.errors[0].message);
            setCleaningStatus(null);
            return;
          }
          setCleaningStatus('Validating and running cleaning pipeline...');
          const success = await uploadAndCleanDataset(results.data, file.name);
          if (!success) {
            setUploadError('Failed to validate or clean uploaded CSV dataset.');
          }
          setCleaningStatus(null);
        },
        error: (err) => {
          setUploadError('Error reading CSV: ' + err.message);
          setCleaningStatus(null);
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Combine all sheets or use first sheet
          let combinedRows: any[] = [];
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet);
            combinedRows = [...combinedRows, ...rows];
          });

          setCleaningStatus('Validating and running cleaning pipeline across sheets...');
          const success = await uploadAndCleanDataset(combinedRows, file.name);
          if (!success) {
            setUploadError('Failed to validate or clean uploaded Excel dataset.');
          }
        } catch (err: any) {
          setUploadError('Error parsing Excel: ' + err.message);
        } finally {
          setCleaningStatus(null);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setUploadError('Unsupported file type. Please upload a .csv, .xlsx, or .xls file.');
      setCleaningStatus(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Preview transactions
  const totalPreviewPages = Math.ceil(transactions.length / previewPageSize) || 1;
  const paginatedPreview = transactions.slice(
    (previewPage - 1) * previewPageSize,
    previewPage * previewPageSize
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              Dataset Management & Preprocessing Pipeline
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              UCI Online Retail II Format
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Automated schema mapping, cancellation detection, duplicate removal, and validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToBenchmarkDataset}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-[#15201A] border border-neutral-200 dark:border-[#22332A] rounded-lg hover:bg-neutral-50 dark:hover:bg-[#1A261F] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore UCI Benchmark</span>
          </button>

          <button
            onClick={exportCleanedCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#14532D] hover:bg-[#1b6b3b] dark:bg-[#16A34A] rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Cleaned Dataset (CSV)</span>
          </button>
        </div>
      </div>

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[#16A34A] bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#121B16] hover:border-neutral-400 dark:hover:border-neutral-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx, .xls"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }}
        />
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#16A34A] flex items-center justify-center mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          Upload UCI Online Retail II Sales Dataset (.csv or .xlsx)
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
          Drag and drop your file here, or click to browse. Automatically combines multiple Excel sheets and auto-identifies column variants.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] font-mono text-neutral-400">
          <span>Expected: Invoice</span>
          <span>·</span>
          <span>StockCode</span>
          <span>·</span>
          <span>Description</span>
          <span>·</span>
          <span>Quantity</span>
          <span>·</span>
          <span>InvoiceDate</span>
          <span>·</span>
          <span>Price</span>
          <span>·</span>
          <span>Customer ID</span>
          <span>·</span>
          <span>Country</span>
        </div>
      </div>

      {/* Upload status / error alerts */}
      {cleaningStatus && (
        <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-lg text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2">
          <Clock className="w-4 h-4 animate-spin shrink-0" />
          <span>{cleaningStatus}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Before-Cleaning vs After-Cleaning Summaries */}
      {datasetSummary && (
        <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Dataset Cleaning & Transformation Audit</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Active Source: <span className="font-semibold">{datasetSummary.name}</span> ({datasetSummary.source})
              </p>
            </div>
            <div className="text-right text-xs font-mono text-neutral-400">
              Uploaded: {new Date(datasetSummary.uploadedAt).toLocaleDateString()}
            </div>
          </div>

          {/* Side by side metric grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
              <div className="text-[10px] text-neutral-400 uppercase font-sans">Raw Records Ingested</div>
              <div className="text-lg font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                {datasetSummary.totalRawRows.toLocaleString()}
              </div>
              <div className="text-[10px] text-neutral-400 font-sans mt-0.5">Unfiltered rows</div>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
              <div className="text-[10px] text-neutral-400 uppercase font-sans">Cleaned Valid Rows</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {datasetSummary.totalCleanedRows.toLocaleString()}
              </div>
              <div className="text-[10px] text-neutral-400 font-sans mt-0.5">Retained for ML model</div>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
              <div className="text-[10px] text-neutral-400 uppercase font-sans">Missing Customer IDs</div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {datasetSummary.missingCustomerIdsRemoved}
              </div>
              <div className="text-[10px] text-neutral-400 font-sans mt-0.5">Guest checkouts dropped</div>
            </div>

            <div className="p-3 bg-neutral-50 dark:bg-[#0E1612] rounded-lg">
              <div className="text-[10px] text-neutral-400 uppercase font-sans">Cancellations Flagged</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5">
                {datasetSummary.cancellationsRemoved}
              </div>
              <div className="text-[10px] text-neutral-400 font-sans mt-0.5">Invoices starting with 'C'</div>
            </div>
          </div>

          {/* Cleaning Pipeline Details Card */}
          <div className="p-3 bg-neutral-50 dark:bg-[#15201A] border border-neutral-200/80 dark:border-[#22332A] rounded-lg text-xs space-y-1.5">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Transformations Applied:</span>
            </div>
            <ul className="list-disc list-inside text-neutral-600 dark:text-neutral-300 text-[11px] space-y-0.5 leading-relaxed">
              <li>Calculated line total amount: <code className="font-mono text-emerald-700 dark:text-emerald-400">TotalAmount = Quantity × Price</code></li>
              <li>Filtered duplicate order lines ({datasetSummary.duplicateRowsRemoved} duplicates pruned)</li>
              <li>Isolated negative and zero unit prices ({datasetSummary.invalidPricesRemoved} invalid prices pruned)</li>
              <li>Standardized timestamps and mapped geographical territories ({datasetSummary.countriesCount} countries identified)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Active Cleaned Dataset Table Preview */}
      <div className="p-5 bg-white dark:bg-[#121B16] border border-neutral-200/80 dark:border-[#1E2922] rounded-xl shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Cleaned Transaction Records Preview
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Viewing active transactions powering all dashboards, clustering, and predictions
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {transactions.length.toLocaleString()} total entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-[10px] uppercase font-semibold">
                <th className="py-2.5 px-3">Invoice</th>
                <th className="py-2.5 px-3">StockCode</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3">Invoice Date</th>
                <th className="py-2.5 px-3 text-right">Price (£)</th>
                <th className="py-2.5 px-3 text-right">Total (£)</th>
                <th className="py-2.5 px-3">Customer ID</th>
                <th className="py-2.5 px-3">Country</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono">
              {paginatedPreview.map((t, idx) => {
                const isCanc = t.IsCancelled || t.Invoice.startsWith('C') || t.Quantity < 0;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-neutral-50 dark:hover:bg-[#16221B] ${
                      isCanc ? 'bg-red-50/30 dark:bg-red-950/20 text-red-700 dark:text-red-300' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-semibold">{t.Invoice}</td>
                    <td className="py-2 px-3 text-neutral-500">{t.StockCode}</td>
                    <td className="py-2 px-3 font-sans max-w-xs truncate">{t.Description}</td>
                    <td className="py-2 px-3 text-right font-semibold">{t.Quantity}</td>
                    <td className="py-2 px-3 text-neutral-500">{t.InvoiceDate}</td>
                    <td className="py-2 px-3 text-right">£{t.Price.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-bold text-neutral-900 dark:text-neutral-100">
                      £{(t.TotalAmount || t.Quantity * t.Price).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-neutral-700 dark:text-neutral-300">#{t.CustomerID}</td>
                    <td className="py-2 px-3 font-sans text-neutral-600 dark:text-neutral-400">{t.Country}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="text-neutral-500 dark:text-neutral-400">
            Page {previewPage} of {totalPreviewPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
              disabled={previewPage === 1}
              className="px-2.5 py-1 border border-neutral-200 dark:border-neutral-800 rounded text-neutral-600 dark:text-neutral-300 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
              disabled={previewPage === totalPreviewPages}
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
