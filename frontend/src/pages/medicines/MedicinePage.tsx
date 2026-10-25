import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { MedicineSchedule, Prescription, DoseStatus } from '../../types';
import {
  Pill,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Calendar,
  AlertCircle,
  FileText,
  User,
  Activity,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const MedicinePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'today' | 'prescriptions' | 'history'>('today');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Today's Doses Query
  const { data: todayDoses = [], isLoading: isTodayLoading } = useQuery<MedicineSchedule[]>({
    queryKey: ['medicine-schedules-today'],
    queryFn: () => api.get<MedicineSchedule[]>('/medicine-schedules/today'),
  });

  // Prescriptions Query
  const { data: prescriptions = [], isLoading: isRxLoading } = useQuery<Prescription[]>({
    queryKey: ['prescriptions'],
    queryFn: () => api.get<Prescription[]>('/prescriptions'),
  });

  // Adherence Summary Query
  const { data: summary } = useQuery<any>({
    queryKey: ['medicine-summary'],
    queryFn: () => api.get<any>('/medicine-schedules/summary'),
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ scheduleId, status }: { scheduleId: number; status: DoseStatus }) =>
      api.post<MedicineSchedule>(`/medicine-schedules/${scheduleId}/status`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['medicine-schedules-today'] });
      queryClient.invalidateQueries({ queryKey: ['medicine-summary'] });
      queryClient.invalidateQueries({ queryKey: ['patient-dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] });
      setActionMessage({
        type: 'success',
        text: `Dose recorded as ${variables.status.toLowerCase()} successfully.`
      });
      setTimeout(() => setActionMessage(null), 3000);
    },
    onError: (err: any) => {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to update dose status.'
      });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  const totalToday = summary?.totalToday || 0;
  const takenToday = summary?.takenToday || 0;
  const missedToday = summary?.missedToday || 0;
  const adherencePct = summary?.adherencePercentage || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Prescriptions & Medicine Tracker</h1>
        <p className="text-sm text-brand-muted mt-1">
          Monitor your daily scheduled doses, record intake adherence, and view clinical prescriptions.
        </p>
      </div>

      {/* Daily Progress Banner */}
      <Card className="bg-gradient-to-r from-brand-navy to-brand-navy-light text-white p-6 border-none shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-semibold tracking-wider text-brand-teal">
              Today's Medication Adherence
            </div>
            <div className="text-3xl font-extrabold mt-1">
              {takenToday} of {totalToday} Doses Recorded
            </div>
            <div className="text-xs text-slate-300 mt-1">
              {totalToday === 0
                ? 'No medications scheduled for today.'
                : `${missedToday} missed • ${Math.max(0, totalToday - takenToday - missedToday)} pending`}
            </div>
          </div>

          <div className="flex items-center space-x-4 sm:border-l sm:border-white/20 sm:pl-6">
            <div className="text-right">
              <div className="text-2xl font-extrabold text-brand-teal font-mono">
                {adherencePct}%
              </div>
              <div className="text-[11px] text-slate-300">Completion Rate</div>
            </div>
          </div>
        </div>
      </Card>

      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-brand-success'
              : 'bg-rose-50 border-rose-200 text-brand-error'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-brand-border pb-2">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'today'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-muted hover:bg-slate-200 hover:text-brand-navy'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Today's Doses ({todayDoses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'prescriptions'
              ? 'bg-brand-navy text-white shadow-sm'
              : 'text-brand-muted hover:bg-slate-200 hover:text-brand-navy'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Doctor Prescriptions ({prescriptions.length})</span>
        </button>
      </div>

      {/* Tab 1: Today's Schedule */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {isTodayLoading ? (
            <div className="py-12 text-center text-sm text-brand-muted">Loading today's doses...</div>
          ) : todayDoses.length === 0 ? (
            <Card className="py-12 text-center">
              <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-brand-navy">No doses scheduled for today</h3>
              <p className="text-xs text-brand-muted mt-1">
                Your prescribed medications and scheduled dose intervals will appear here automatically.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayDoses.map((dose) => (
                <Card
                  key={dose.scheduleId}
                  className={`border-l-4 transition ${
                    dose.status === 'TAKEN'
                      ? 'border-l-brand-success bg-emerald-50/20'
                      : dose.status === 'MISSED'
                      ? 'border-l-brand-error bg-rose-50/20'
                      : 'border-l-brand-teal'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-brand-border">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-xl bg-brand-panel text-brand-navy flex items-center justify-center font-bold text-xs">
                        {dose.timePeriod.substring(0, 3)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-brand-navy">
                          {dose.prescription.medicine}
                        </h3>
                        <div className="text-xs text-brand-muted font-medium">
                          {dose.prescription.dosage} • {dose.foodInstruction}
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={
                        dose.status === 'TAKEN'
                          ? 'success'
                          : dose.status === 'MISSED'
                          ? 'error'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {dose.status}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-brand-muted">
                    <div className="flex items-center gap-1.5 font-medium text-brand-navy">
                      <Clock className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Scheduled: {dose.scheduledTime.substring(0, 5)}</span>
                    </div>
                    {dose.prescription.doctor && (
                      <div className="text-[11px] text-slate-500">
                        Prescribed by {dose.prescription.doctor.fullName}
                      </div>
                    )}
                  </div>

                  {/* Status Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between gap-2">
                    {dose.status === 'PENDING' ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1 text-slate-600 hover:text-brand-error hover:bg-rose-50"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              scheduleId: dose.scheduleId,
                              status: 'MISSED',
                            })
                          }
                          icon={<XCircle className="w-3.5 h-3.5" />}
                        >
                          Mark Missed
                        </Button>
                        <Button
                          variant="teal"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              scheduleId: dose.scheduleId,
                              status: 'TAKEN',
                            })
                          }
                          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        >
                          Mark Taken
                        </Button>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between">
                        <span className="text-xs text-brand-muted">
                          Recorded status:{' '}
                          <span className="font-bold text-brand-navy">{dose.status}</span>
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              scheduleId: dose.scheduleId,
                              status: 'PENDING',
                            })
                          }
                          icon={<RotateCcw className="w-3 h-3" />}
                        >
                          Change
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Doctor Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {isRxLoading ? (
            <div className="py-12 text-center text-sm text-brand-muted">Loading prescriptions...</div>
          ) : prescriptions.length === 0 ? (
            <Card className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-brand-navy">No prescriptions on record</h3>
              <p className="text-xs text-brand-muted mt-1">
                Prescriptions issued by verified doctors after consultations will be archived here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <Card key={rx.prescriptionId} hoverEffect className="space-y-3">
                  <div className="flex items-start justify-between pb-3 border-b border-brand-border">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center font-bold">
                        Rx
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-brand-navy">{rx.medicine}</h3>
                        <div className="text-xs text-brand-muted">
                          {rx.dosage} • {rx.route}
                        </div>
                      </div>
                    </div>
                    <Badge variant="teal" size="sm">
                      {rx.foodInstruction}
                    </Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-brand-muted">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Frequency:</span>
                      <span>{rx.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Duration:</span>
                      <span>
                        {rx.startDate} to {rx.endDate || 'Ongoing'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Prescribing Doctor:</span>
                      <span className="font-semibold text-brand-navy">{rx.doctor.fullName}</span>
                    </div>
                    {rx.additionalInstructions && (
                      <p className="pt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {rx.additionalInstructions}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
