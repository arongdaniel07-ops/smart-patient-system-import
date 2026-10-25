import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getToken } from '../../lib/api-client';
import { MedicalReport, ReportType, ReportComparisonResult, ReportValue } from '../../types';
import {
  FileText,
  Upload,
  Download,
  Eye,
  TrendingUp,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldAlert,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

export const ReportsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ReportType>('LAB');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Compare selection state
  const [olderReportId, setOlderReportId] = useState<number | null>(null);
  const [newerReportId, setNewerReportId] = useState<number | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ReportComparisonResult | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<ReportType>('LAB');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [structuredValues, setStructuredValues] = useState<
    Array<{ testName: string; numericValue: string; unit: string; min: string; max: string }>
  >([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Query patient reports
  const { data: reports = [], isLoading } = useQuery<MedicalReport[]>({
    queryKey: ['medical-reports', activeTab],
    queryFn: () => api.get<MedicalReport[]>(`/reports?type=${activeTab}`),
  });

  // Query all lab reports (for compare dropdown)
  const { data: allLabReports = [] } = useQuery<MedicalReport[]>({
    queryKey: ['medical-reports-all-lab'],
    queryFn: () => api.get<MedicalReport[]>('/reports?type=LAB'),
  });

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => api.post<any>('/reports/upload', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-reports'] });
      queryClient.invalidateQueries({ queryKey: ['medical-reports-all-lab'] });
      queryClient.invalidateQueries({ queryKey: ['patient-dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] });
      setIsUploadModalOpen(false);
      resetUploadForm();
    },
    onError: (err: any) => {
      setUploadError(err.message || 'Failed to upload document.');
    },
  });

  // Compare Mutation
  const compareMutation = useMutation({
    mutationFn: (body: { olderReportId: number; newerReportId: number }) =>
      api.post<ReportComparisonResult>('/reports/compare', body),
    onSuccess: (data) => {
      setComparisonResult(data);
      setCompareError(null);
    },
    onError: (err: any) => {
      setCompareError(err.message || 'Comparison failed.');
    },
  });

  const resetUploadForm = () => {
    setUploadTitle('');
    setUploadType('LAB');
    setUploadDate(new Date().toISOString().split('T')[0]);
    setUploadDesc('');
    setSelectedFile(null);
    setStructuredValues([]);
    setUploadError(null);
  };

  const handleAddStructuredValue = () => {
    setStructuredValues((prev) => [
      ...prev,
      { testName: '', numericValue: '', unit: 'mg/dL', min: '', max: '' },
    ]);
  };

  const handleRemoveStructuredValue = (index: number) => {
    setStructuredValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a PDF, PNG, or JPEG file to upload.');
      return;
    }

    setUploadError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('reportTitle', uploadTitle);
    formData.append('reportType', uploadType);
    formData.append('reportDate', uploadDate);
    if (uploadDesc) formData.append('description', uploadDesc);

    // Format structured values
    if (structuredValues.length > 0) {
      const formatted = structuredValues
        .filter((v) => v.testName.trim() && v.numericValue.trim())
        .map((v) => ({
          testName: v.testName,
          normalizedTestKey: v.testName.trim().toUpperCase().replace(/\s+/g, '_'),
          numericValue: parseFloat(v.numericValue),
          unit: v.unit,
          referenceRangeMin: v.min ? parseFloat(v.min) : null,
          referenceRangeMax: v.max ? parseFloat(v.max) : null,
        }));
      formData.append('structuredValuesJson', JSON.stringify(formatted));
    }

    uploadMutation.mutate(formData);
  };

  const handleDownload = async (reportId: number, filename: string) => {
    try {
      const blob = await api.get<Blob>(`/reports/${reportId}/download`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setPageError(err.message || 'Download permission denied or file not found.');
      setTimeout(() => setPageError(null), 5000);
    }
  };

  const handleTriggerCompare = () => {
    if (!olderReportId || !newerReportId) {
      setCompareError('Please select two laboratory reports to compare.');
      return;
    }
    if (olderReportId === newerReportId) {
      setCompareError('Please choose two distinct reports to compare.');
      return;
    }
    setCompareError(null);
    compareMutation.mutate({ olderReportId, newerReportId });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Medical Reports & Scans</h1>
          <p className="text-sm text-brand-muted mt-1">
            Access your encrypted laboratory records, diagnostic scans, and compare changes over time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            icon={<TrendingUp className="w-4 h-4 text-brand-teal" />}
            onClick={() => {
              if (allLabReports.length >= 2) {
                setOlderReportId(allLabReports[1].reportId);
                setNewerReportId(allLabReports[0].reportId);
              }
              setIsCompareModalOpen(true);
            }}
          >
            Compare Reports
          </Button>
          <Button
            variant="teal"
            size="md"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => {
              resetUploadForm();
              setIsUploadModalOpen(true);
            }}
          >
            Upload Document
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-brand-border pb-2">
        <button
          onClick={() => setActiveTab('LAB')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'LAB'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-muted hover:bg-slate-200 hover:text-brand-navy'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Laboratory Reports</span>
        </button>
        <button
          onClick={() => setActiveTab('SCAN')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'SCAN'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-muted hover:bg-slate-200 hover:text-brand-navy'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Scans & Diagnostic Imaging</span>
        </button>
      </div>

      {/* Report Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-brand-muted">Loading medical documents...</div>
      ) : reports.length === 0 ? (
        <Card className="py-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-brand-navy">No {activeTab.toLowerCase()} documents uploaded</h3>
          <p className="text-xs text-brand-muted mt-1">
            Upload your existing laboratory test results or diagnostic scans.
          </p>
          <Button
            variant="teal"
            size="sm"
            className="mt-4"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Document
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <Card key={report.reportId} hoverEffect className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-brand-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-panel text-brand-navy flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5 text-brand-teal" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-brand-navy line-clamp-1" title={report.reportTitle}>
                        {report.reportTitle}
                      </h3>
                      <div className="text-xs text-brand-muted mt-0.5">
                        Test Date: {report.reportDate}
                      </div>
                    </div>
                  </div>
                  <Badge variant={report.reportType === 'LAB' ? 'teal' : 'primary'} size="sm">
                    {report.reportType}
                  </Badge>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-brand-muted">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Original File:</span>
                    <span className="font-mono truncate max-w-[200px]">{report.originalFilename}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Size:</span>
                    <span>{(report.fileSize / 1024).toFixed(1)} KB</span>
                  </div>
                  {report.doctor && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">Ordering Doctor:</span>
                      <span>{report.doctor.fullName}</span>
                    </div>
                  )}
                  {report.description && (
                    <p className="pt-1 text-[11px] text-slate-500 italic line-clamp-2">
                      "{report.description}"
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between">
                <span className="text-[11px] text-brand-muted">
                  Encrypted File Storage
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="w-3.5 h-3.5" />}
                    onClick={() => handleDownload(report.reportId, report.originalFilename)}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Document Modal Dialog */}
      <Dialog
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Medical Document"
        description="Add previous laboratory results or scan images to your Patient ID record."
        maxWidth="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-brand-error text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <Input
            label="Report Title"
            required
            placeholder="e.g. Comprehensive Lipid Profile, Chest X-Ray"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Document Type"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as ReportType)}
              options={[
                { value: 'LAB', label: 'Laboratory Blood Test (LAB)' },
                { value: 'SCAN', label: 'Imaging & Scan (SCAN)' },
              ]}
            />
            <Input
              label="Report Date"
              type="date"
              required
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1.5">
              Select Document File <span className="text-brand-error">*</span>
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-panel file:text-brand-navy hover:file:bg-slate-200 cursor-pointer border border-brand-border rounded-xl p-2 bg-white"
            />
            <p className="text-[11px] text-brand-muted mt-1">
              Supported formats: PDF, JPEG, PNG (Maximum size 15 MB)
            </p>
          </div>

          <Input
            label="Notes / Clinical Impression (Optional)"
            placeholder="e.g. Baseline blood test before initiating statin therapy"
            value={uploadDesc}
            onChange={(e) => setUploadDesc(e.target.value)}
          />

          {/* Optional Structured Values Section (for Lab reports) */}
          {uploadType === 'LAB' && (
            <div className="p-3.5 bg-brand-panel/60 rounded-xl border border-brand-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-brand-navy">Structured Test Values</div>
                  <div className="text-[11px] text-brand-muted">
                    Enter key values for automatic longitudinal comparison
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStructuredValue}
                  icon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Test Row
                </Button>
              </div>

              {structuredValues.map((row, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-brand-border">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Test (e.g. Total Cholesterol)"
                      value={row.testName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStructuredValues((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, testName: val } : item))
                        );
                      }}
                      className="w-full text-xs p-1.5 border border-brand-border rounded-lg"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Value"
                      value={row.numericValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStructuredValues((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, numericValue: val } : item))
                        );
                      }}
                      className="w-full text-xs p-1.5 border border-brand-border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Unit"
                      value={row.unit}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStructuredValues((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, unit: val } : item))
                        );
                      }}
                      className="w-full text-xs p-1.5 border border-brand-border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2 flex gap-1">
                    <input
                      type="number"
                      placeholder="Min"
                      value={row.min}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStructuredValues((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, min: val } : item))
                        );
                      }}
                      className="w-1/2 text-xs p-1 border border-brand-border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={row.max}
                      onChange={(e) => {
                        const val = e.target.value;
                        setStructuredValues((prev) =>
                          prev.map((item, i) => (i === index ? { ...item, max: val } : item))
                        );
                      }}
                      className="w-1/2 text-xs p-1 border border-brand-border rounded-lg"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveStructuredValue(index)}
                      className="text-slate-400 hover:text-brand-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="teal"
              size="md"
              isLoading={uploadMutation.isPending}
            >
              Upload & Secure
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Compare Reports Modal Dialog */}
      <Dialog
        isOpen={isCompareModalOpen}
        onClose={() => {
          setIsCompareModalOpen(false);
          setComparisonResult(null);
        }}
        title="Compare Laboratory Reports"
        description="Select two historical blood tests to evaluate longitudinal changes side-by-side."
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Report Selection Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-brand-panel/60 rounded-xl border border-brand-border/80">
            <Select
              label="Baseline Report (Older Date)"
              value={olderReportId || ''}
              onChange={(e) => setOlderReportId(Number(e.target.value))}
            >
              <option value="">Select Baseline Report</option>
              {allLabReports.map((r) => (
                <option key={r.reportId} value={r.reportId}>
                  {r.reportTitle} ({r.reportDate})
                </option>
              ))}
            </Select>

            <Select
              label="Follow-up Report (Newer Date)"
              value={newerReportId || ''}
              onChange={(e) => setNewerReportId(Number(e.target.value))}
            >
              <option value="">Select Follow-up Report</option>
              {allLabReports.map((r) => (
                <option key={r.reportId} value={r.reportId}>
                  {r.reportTitle} ({r.reportDate})
                </option>
              ))}
            </Select>

            {compareError && (
              <div className="sm:col-span-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-brand-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{compareError}</span>
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end">
              <Button
                variant="teal"
                size="md"
                onClick={handleTriggerCompare}
                isLoading={compareMutation.isPending}
                icon={<TrendingUp className="w-4 h-4" />}
              >
                Generate Comparison Table
              </Button>
            </div>
          </div>

          {/* Comparison Results Table */}
          {comparisonResult && (
            <div className="space-y-4">
              {/* Disclaimer */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-brand-warning shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">
                  {comparisonResult.disclaimer}
                </span>
              </div>

              {/* Matched Metrics Table */}
              <div className="overflow-x-auto rounded-xl border border-brand-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-brand-navy text-white text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Test Name</th>
                      <th className="py-3 px-4">
                        Baseline ({comparisonResult.olderReportDate})
                      </th>
                      <th className="py-3 px-4">
                        Follow-up ({comparisonResult.newerReportDate})
                      </th>
                      <th className="py-3 px-4">Difference</th>
                      <th className="py-3 px-4">% Change</th>
                      <th className="py-3 px-4">Trend</th>
                      <th className="py-3 px-4">Ref Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border bg-white">
                    {comparisonResult.matchedMetrics.map((metric) => (
                      <tr key={metric.normalizedTestKey} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-semibold text-brand-navy">
                          {metric.testName}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-medium">
                            {metric.olderValue} {metric.unit}
                          </span>
                          <span className="ml-1 text-[10px] text-brand-muted">
                            ({metric.olderStatus})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-brand-navy">
                            {metric.newerValue} {metric.unit}
                          </span>
                          <span className="ml-1 text-[10px] text-brand-muted">
                            ({metric.newerStatus})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold">
                          <span className={metric.difference < 0 ? 'text-brand-success' : metric.difference > 0 ? 'text-brand-info' : 'text-slate-600'}>
                            {metric.difference > 0 ? `+${metric.difference}` : metric.difference} {metric.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {metric.percentageDifference !== undefined ? (
                            <span
                              className={`px-2 py-0.5 rounded ${
                                metric.percentageDifference < 0
                                  ? 'bg-emerald-100 text-brand-success'
                                  : 'bg-sky-100 text-brand-info'
                              }`}
                            >
                              {metric.percentageDifference > 0 ? `+${metric.percentageDifference}%` : `${metric.percentageDifference}%`}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              metric.trend === 'DECREASED'
                                ? 'success'
                                : metric.trend === 'INCREASED'
                                ? 'info'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {metric.trend}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-brand-muted font-mono text-[11px]">
                          {metric.referenceRangeMin !== undefined && metric.referenceRangeMax !== undefined
                            ? `${metric.referenceRangeMin} - ${metric.referenceRangeMax}`
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};
