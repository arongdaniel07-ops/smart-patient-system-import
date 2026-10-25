import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { RecordShare, Doctor } from '../../types';
import {
  Share2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  AlertCircle,
  Copy,
  Check,
  Trash2,
  Stethoscope,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';

export const RecordSharingPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('CODE_ONLY');
  const [selectedDuration, setSelectedDuration] = useState<number>(72);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [createdShare, setCreatedShare] = useState<RecordShare | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Query existing shares
  const { data: shares = [], isLoading } = useQuery<RecordShare[]>({
    queryKey: ['record-shares'],
    queryFn: () => api.get<RecordShare[]>('/shares'),
  });

  // Query verified doctors
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['doctors-verified'],
    queryFn: () => api.get<Doctor[]>('/doctors'),
  });

  // Create Share Mutation
  const createShareMutation = useMutation({
    mutationFn: (body: any) => api.post<RecordShare>('/shares', body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['record-shares'] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] });
      setCreatedShare(data);
    },
  });

  // Revoke Share Mutation
  const revokeShareMutation = useMutation({
    mutationFn: (shareId: number) => api.post(`/shares/${shareId}/revoke`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record-shares'] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] });
    },
  });

  const handleCreateShare = (e: React.FormEvent) => {
    e.preventDefault();
    createShareMutation.mutate({
      doctorId: selectedDoctorId === 'CODE_ONLY' ? null : Number(selectedDoctorId),
      durationHours: selectedDuration,
      categoryScope: selectedCategory,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Patient-Controlled Record Sharing</h1>
          <p className="text-sm text-brand-muted mt-1">
            Grant secure, time-limited access to verified doctors. You maintain ownership and can revoke access anytime.
          </p>
        </div>
        <Button
          variant="teal"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setCreatedShare(null);
            setIsShareModalOpen(true);
          }}
        >
          Grant Record Access
        </Button>
      </div>

      {/* Sharing Security Info Banner */}
      <Card className="bg-brand-panel/70 border-brand-border/80 p-5">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-xl bg-white border border-brand-border text-brand-teal shrink-0">
            <Lock className="w-5 h-5 text-brand-teal" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-brand-navy">Zero Unrestricted Access Policy</h3>
            <p className="text-xs text-brand-muted leading-relaxed">
              Doctors cannot search your medical records without an active sharing grant. Once an access code expires or is revoked below, all further file streaming and download permissions are terminated immediately at the server level.
            </p>
          </div>
        </div>
      </Card>

      {/* Active Shares List */}
      <Card>
        <CardHeader
          title="Active & Historical Sharing Grants"
          subtitle="Real-time list of all permissions linked to your health account"
        />

        {isLoading ? (
          <div className="py-12 text-center text-sm text-brand-muted">Loading sharing permissions...</div>
        ) : shares.length === 0 ? (
          <div className="py-12 text-center">
            <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-brand-navy">No record sharing grants active</h3>
            <p className="text-xs text-brand-muted mt-1">
              Create a sharing grant or generate an access code to provide your doctor with consultation history.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-panel text-brand-navy text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Authorized Doctor / Code</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4">Granted On</th>
                  <th className="py-3 px-4">Expires At</th>
                  <th className="py-3 px-4">Last Accessed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border bg-white">
                {shares.map((share) => {
                  const isActive = share.status === 'ACTIVE' && new Date(share.expiresAt) > new Date();
                  return (
                    <tr key={share.shareId} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-semibold text-brand-navy">
                        {share.doctor ? (
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="w-3.5 h-3.5 text-brand-teal" />
                            <span>{share.doctor.fullName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-brand-teal px-2 py-0.5 bg-brand-panel rounded">
                              {share.sharingCode}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="teal" size="sm">
                          {share.categoryScope}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-brand-muted font-mono text-[11px]">
                        {share.createdAt ? share.createdAt.split('T')[0] : ''}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className={isActive ? 'text-brand-navy font-semibold' : 'text-slate-400'}>
                          {share.expiresAt ? share.expiresAt.replace('T', ' ').substring(0, 16) : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-brand-muted font-mono text-[11px]">
                        {share.lastAccessedAt ? share.lastAccessedAt.replace('T', ' ').substring(0, 16) : 'Never'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={isActive ? 'success' : share.status === 'REVOKED' ? 'error' : 'neutral'}
                          size="sm"
                        >
                          {isActive ? 'ACTIVE' : share.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isActive && (
                          <Button
                            variant="danger"
                            size="sm"
                            isLoading={revokeShareMutation.isPending}
                            onClick={() => revokeShareMutation.mutate(share.shareId)}
                          >
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Grant Access Modal */}
      <Dialog
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setCreatedShare(null);
        }}
        title="Grant Medical Record Access"
        description="Configure permissions, duration, and authorization target."
        maxWidth="md"
      >
        {createdShare ? (
          <div className="space-y-5 text-center p-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-brand-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold text-lg text-brand-navy">Access Permission Created</h3>
              <p className="text-xs text-brand-muted mt-1">
                Provide this single-use code to your doctor during consultation.
              </p>
            </div>

            <div className="p-4 bg-brand-panel rounded-2xl border border-brand-border text-center">
              <div className="text-xs uppercase font-semibold text-brand-muted">
                Doctor Access Code
              </div>
              <div className="text-3xl font-mono font-extrabold text-brand-navy mt-1 tracking-widest">
                {createdShare.sharingCode}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => copyToClipboard(createdShare.sharingCode || '')}
                icon={copiedCode ? <Check className="w-3.5 h-3.5 text-brand-success" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copiedCode ? 'Copied to Clipboard' : 'Copy Code'}
              </Button>
            </div>

            <div className="text-xs text-brand-muted">
              Scope: <span className="font-semibold text-brand-navy">{createdShare.categoryScope}</span> • Valid for:{' '}
              <span className="font-semibold text-brand-navy">{selectedDuration} Hours</span>
            </div>

            <Button
              variant="teal"
              size="md"
              className="w-full"
              onClick={() => {
                setIsShareModalOpen(false);
                setCreatedShare(null);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCreateShare} className="space-y-4">
            <Select
              label="Recipient Doctor"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
            >
              <option value="CODE_ONLY">Generate Time-Limited Sharing Code (Any Doctor)</option>
              {doctors.map((d) => (
                <option key={d.doctorId} value={d.doctorId}>
                  {d.fullName} ({d.specialty} - {d.hospital?.name})
                </option>
              ))}
            </Select>

            <Select
              label="Sharing Scope"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Records (Lab Reports, Scans, & Prescriptions)' },
                { value: 'LAB', label: 'Laboratory Blood Reports Only' },
                { value: 'SCAN', label: 'Scans & Diagnostic Imaging Only' },
                { value: 'PRESCRIPTION', label: 'Prescriptions & Medication History Only' },
              ]}
            />

            <Select
              label="Access Expiration"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              options={[
                { value: 24, label: '24 Hours (1 Day)' },
                { value: 72, label: '72 Hours (3 Days - Recommended)' },
                { value: 168, label: '7 Days (1 Week)' },
                { value: 720, label: '30 Days (1 Month)' },
              ]}
            />

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsShareModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="teal"
                size="md"
                isLoading={createShareMutation.isPending}
              >
                Generate Permission
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
};
