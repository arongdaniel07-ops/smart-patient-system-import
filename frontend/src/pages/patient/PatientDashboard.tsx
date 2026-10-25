import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import {
  Calendar,
  FileText,
  Pill,
  Clock,
  Share2,
  Building2,
  TrendingUp,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PatientDashboardSummary, PatientTimelineEvent } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

  // Summary Metrics Query
  const { data: summary, isLoading: isSummaryLoading } = useQuery<PatientDashboardSummary>({
    queryKey: ['patient-dashboard-summary'],
    queryFn: () => api.get<PatientDashboardSummary>('/patients/me/dashboard'),
  });

  // Timeline Events Query
  const { data: timeline = [], isLoading: isTimelineLoading } = useQuery<PatientTimelineEvent[]>({
    queryKey: ['patient-timeline'],
    queryFn: () => api.get<PatientTimelineEvent[]>('/patients/me/timeline'),
  });

  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Patient';

  return (
    <div className="space-y-6">
      {/* Top Greeting & Patient ID */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-teal">
            <span className="w-2 h-2 rounded-full bg-brand-teal"></span>
            Personal Health Dashboard
          </div>
          <h1 className="text-2xl font-bold text-brand-navy mt-1">
            Good day, {firstName} 👋
          </h1>
          <p className="text-sm text-brand-muted">
            Today is{' '}
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-brand-panel rounded-xl border border-brand-border text-right">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-brand-muted">
              Patient ID
            </div>
            <div className="text-lg font-bold font-mono text-brand-navy">
              {summary?.patientCode || user?.patientCode || 'PT-2026-XXXX'}
            </div>
          </div>
          <Link to="/sharing">
            <Button variant="teal" size="md" icon={<Share2 className="w-4 h-4" />}>
              Share Records
            </Button>
          </Link>
        </div>
      </div>

      {/* Four Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Upcoming Appointment */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-brand-navy border border-sky-100">
              <Calendar className="w-5 h-5 text-brand-navy" />
            </div>
            <Badge variant={summary?.upcomingAppointmentDateTime ? 'info' : 'neutral'}>
              {summary?.upcomingAppointmentDateTime ? 'Upcoming' : 'None'}
            </Badge>
          </div>
          <div className="text-xs text-brand-muted font-medium">Upcoming Appointment</div>
          {summary?.upcomingAppointmentDoctor ? (
            <div className="mt-1">
              <div className="font-bold text-brand-navy text-base truncate">
                {summary.upcomingAppointmentDoctor}
              </div>
              <div className="text-xs text-brand-muted truncate mt-0.5">
                {summary.upcomingAppointmentSpecialty} • {summary.upcomingAppointmentHospital}
              </div>
              <div className="text-xs font-semibold text-brand-navy mt-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-teal" />
                {summary.upcomingAppointmentDateTime}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-brand-muted">
              No scheduled appointments.{' '}
              <Link to="/appointments" className="text-brand-teal font-semibold hover:underline block mt-1">
                Book a consultation →
              </Link>
            </div>
          )}
        </Card>

        {/* Card 2: Latest Medical Report */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-teal-50 text-brand-teal border border-teal-100">
              <FileText className="w-5 h-5 text-brand-teal" />
            </div>
            <Badge variant={summary?.latestReportTitle ? 'teal' : 'neutral'}>
              {summary?.latestReportType || 'None'}
            </Badge>
          </div>
          <div className="text-xs text-brand-muted font-medium">Latest Medical Report</div>
          {summary?.latestReportTitle ? (
            <div className="mt-1">
              <div className="font-bold text-brand-navy text-base truncate" title={summary.latestReportTitle}>
                {summary.latestReportTitle}
              </div>
              <div className="text-xs text-brand-muted mt-0.5">
                Dated: {summary.latestReportDate}
              </div>
              <Link
                to="/reports"
                className="text-xs font-semibold text-brand-teal hover:underline mt-2 inline-flex items-center gap-1"
              >
                View & Compare Reports →
              </Link>
            </div>
          ) : (
            <div className="mt-2 text-xs text-brand-muted">
              No medical reports recorded.{' '}
              <Link to="/reports" className="text-brand-teal font-semibold hover:underline block mt-1">
                Upload your first report →
              </Link>
            </div>
          )}
        </Card>

        {/* Card 3: Today's Medicine Progress */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-brand-success border border-emerald-100">
              <Pill className="w-5 h-5 text-brand-success" />
            </div>
            <Badge variant={summary?.totalDosesToday ? 'success' : 'neutral'}>
              {summary?.totalDosesToday ? `${summary.takenDosesToday}/${summary.totalDosesToday}` : 'None'}
            </Badge>
          </div>
          <div className="text-xs text-brand-muted font-medium">Today's Medicine Progress</div>
          {summary && summary.totalDosesToday > 0 ? (
            <div className="mt-1">
              <div className="font-bold text-brand-navy text-xl">
                {summary.takenDosesToday} of {summary.totalDosesToday} doses
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-brand-success h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round((summary.takenDosesToday / summary.totalDosesToday) * 100)}%`,
                  }}
                />
              </div>
              <Link to="/medicines" className="text-xs font-semibold text-brand-teal hover:underline mt-2 inline-block">
                Manage Doses Schedule →
              </Link>
            </div>
          ) : (
            <div className="mt-2 text-xs text-brand-muted">
              No doses scheduled for today.{' '}
              <Link to="/medicines" className="text-brand-teal font-semibold hover:underline block mt-1">
                View medicine tracker →
              </Link>
            </div>
          )}
        </Card>

        {/* Card 4: Next Follow-up */}
        <Card hoverEffect className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-brand-warning border border-amber-100">
              <Clock className="w-5 h-5 text-brand-warning" />
            </div>
            <Badge variant={summary?.nextFollowUpDate ? 'warning' : 'neutral'}>
              {summary?.nextFollowUpDate ? 'Active' : 'None'}
            </Badge>
          </div>
          <div className="text-xs text-brand-muted font-medium">Next Recommended Follow-up</div>
          {summary?.nextFollowUpDate ? (
            <div className="mt-1">
              <div className="font-bold text-brand-navy text-base truncate">
                {summary.nextFollowUpDoctor}
              </div>
              <div className="text-xs text-brand-muted truncate mt-0.5">
                {summary.nextFollowUpReason}
              </div>
              <div className="text-xs font-semibold text-brand-warning mt-2 flex items-center gap-1">
                Due by: {summary.nextFollowUpDate}
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-brand-muted">
              No pending clinical follow-ups.{' '}
              <Link to="/follow-ups" className="text-brand-teal font-semibold hover:underline block mt-1">
                View past follow-ups →
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card>
        <CardHeader title="Quick Health Actions" subtitle="Direct shortcuts for patient care and management" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/find-care"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-brand-panel hover:bg-slate-200 transition text-center group border border-brand-border/60"
          >
            <Building2 className="w-6 h-6 text-brand-navy group-hover:scale-110 transition duration-150 mb-1.5" />
            <span className="text-xs font-semibold text-brand-navy">Find Care</span>
          </Link>

          <Link
            to="/appointments"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-brand-panel hover:bg-slate-200 transition text-center group border border-brand-border/60"
          >
            <Calendar className="w-6 h-6 text-brand-navy group-hover:scale-110 transition duration-150 mb-1.5" />
            <span className="text-xs font-semibold text-brand-navy">Book Visit</span>
          </Link>

          <Link
            to="/reports"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-brand-panel hover:bg-slate-200 transition text-center group border border-brand-border/60"
          >
            <Upload className="w-6 h-6 text-brand-teal group-hover:scale-110 transition duration-150 mb-1.5" />
            <span className="text-xs font-semibold text-brand-navy">Upload Report</span>
          </Link>

          <Link
            to="/reports"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-brand-panel hover:bg-slate-200 transition text-center group border border-brand-border/60"
          >
            <TrendingUp className="w-6 h-6 text-brand-teal group-hover:scale-110 transition duration-150 mb-1.5" />
            <span className="text-xs font-semibold text-brand-navy">Compare Labs</span>
          </Link>

          <Link
            to="/medicines"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-brand-panel hover:bg-slate-200 transition text-center group border border-brand-border/60"
          >
            <Pill className="w-6 h-6 text-brand-success group-hover:scale-110 transition duration-150 mb-1.5" />
            <span className="text-xs font-semibold text-brand-navy">Dose Tracker</span>
          </Link>

          <Link
            to="/sharing"
            className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-brand-panel hover:bg-slate-200 transition text-center group border border-brand-border/60"
          >
            <Share2 className="w-6 h-6 text-brand-info group-hover:scale-110 transition duration-150 mb-1.5" />
            <span className="text-xs font-semibold text-brand-navy">Share Access</span>
          </Link>
        </div>
      </Card>

      {/* Patient ID Timeline */}
      <Card>
        <CardHeader
          title="Patient ID Timeline"
          subtitle="Chronological, tamper-evident audit record of your health profile activity"
          action={
            <Badge variant="teal" size="sm">
              Live Encounters
            </Badge>
          }
        />

        {isTimelineLoading ? (
          <div className="py-8 text-center text-sm text-brand-muted">Loading timeline records...</div>
        ) : timeline.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-brand-muted">No timeline activity recorded yet.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
            {timeline.map((event) => (
              <div key={event.id} className="relative group">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[29px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    event.badgeType === 'success'
                      ? 'bg-brand-success'
                      : event.badgeType === 'error'
                      ? 'bg-brand-error'
                      : event.badgeType === 'warning'
                      ? 'bg-brand-warning'
                      : 'bg-brand-teal'
                  }`}
                />
                <div className="bg-brand-bg/70 p-4 rounded-xl border border-brand-border/80 hover:border-brand-teal/40 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <span className="font-semibold text-sm text-brand-navy">{event.title}</span>
                    <span className="text-[11px] text-brand-muted">
                      {event.timestamp
                        ? new Date(event.timestamp).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted leading-relaxed">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
