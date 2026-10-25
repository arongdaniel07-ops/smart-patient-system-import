import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { FollowUp, FollowUpStatus } from '../../types';
import {
  Clock,
  Calendar,
  Stethoscope,
  Building2,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const FollowUpsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: followUps = [], isLoading } = useQuery<FollowUp[]>({
    queryKey: ['follow-ups'],
    queryFn: () => api.get<FollowUp[]>('/follow-ups'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ followUpId, status }: { followUpId: number; status: FollowUpStatus }) =>
      api.put<FollowUp>(`/follow-ups/${followUpId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['patient-dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Follow-up Tracking</h1>
        <p className="text-sm text-brand-muted mt-1">
          Stay on top of clinical recommendations, post-treatment reviews, and scheduled follow-ups.
        </p>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-brand-muted">Loading follow-ups...</div>
      ) : followUps.length === 0 ? (
        <Card className="py-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-brand-navy">No follow-ups recorded</h3>
          <p className="text-xs text-brand-muted mt-1">
            Clinical follow-up dates recommended by your doctor during consultations will appear here.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {followUps.map((fu) => {
            const isDueSoon = new Date(fu.followUpDate) >= new Date();
            return (
              <Card key={fu.followUpId} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-brand-border">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-brand-warning flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                          Follow-up Target
                        </div>
                        <div className="text-base font-bold text-brand-navy">
                          {fu.followUpDate}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        fu.status === 'COMPLETED'
                          ? 'success'
                          : fu.status === 'ACKNOWLEDGED'
                          ? 'info'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {fu.status}
                    </Badge>
                  </div>

                  <div className="mt-3.5 space-y-2 text-xs text-brand-muted">
                    <div className="flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-brand-teal shrink-0" />
                      <span className="font-semibold text-brand-navy">{fu.doctor.fullName}</span>
                      <span>({fu.doctor.specialty})</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      <span className="font-semibold text-brand-navy block mb-0.5">Clinical Reason:</span>
                      {fu.reason}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between gap-2">
                  {fu.status === 'UPCOMING' && (
                    <button
                      onClick={() =>
                        updateStatusMutation.mutate({
                          followUpId: fu.followUpId,
                          status: 'ACKNOWLEDGED',
                        })
                      }
                      className="text-xs text-brand-muted hover:text-brand-navy flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-teal" /> Acknowledge
                    </button>
                  )}
                  <div className="ml-auto">
                    <Button
                      variant="teal"
                      size="sm"
                      onClick={() =>
                        navigate(`/appointments?bookDoctorId=${fu.doctor.doctorId}`)
                      }
                      icon={<Calendar className="w-3.5 h-3.5" />}
                    >
                      Book Visit for this Review
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
