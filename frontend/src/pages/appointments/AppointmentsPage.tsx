import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api-client';
import { Appointment, Doctor, Hospital, TimeSlot } from '../../types';
import {
  Calendar,
  Clock,
  Building2,
  Stethoscope,
  Plus,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  User,
} from 'lucide-react';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';

export const AppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [cancellingAppt, setCancellingAppt] = useState<Appointment | null>(null);

  // Booking Form State
  const [selectedHospitalId, setSelectedHospitalId] = useState<number>(1);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedStartTime, setSelectedStartTime] = useState<string>('10:00:00');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Parse query params if coming from "Book Visit" button on Find Care page
  useEffect(() => {
    const docParam = searchParams.get('bookDoctorId');
    const hospParam = searchParams.get('hospitalId');
    if (docParam) {
      setSelectedDoctorId(Number(docParam));
      if (hospParam) setSelectedHospitalId(Number(hospParam));
      setIsBookModalOpen(true);
    }
  }, [searchParams]);

  // Appointments Query
  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: () => api.get<Appointment[]>('/appointments'),
  });

  // Hospitals Query
  const { data: hospitals = [] } = useQuery<Hospital[]>({
    queryKey: ['hospitals'],
    queryFn: () => api.get<Hospital[]>('/hospitals'),
  });

  // Doctors Query
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['doctors-verified'],
    queryFn: () => api.get<Doctor[]>('/doctors'),
  });

  // Slots Query for selected doctor and date
  const { data: availableSlots = [], isLoading: isSlotsLoading } = useQuery<TimeSlot[]>({
    queryKey: ['doctor-slots', selectedDoctorId, selectedDate],
    queryFn: () => api.get<TimeSlot[]>(`/doctors/${selectedDoctorId}/slots?date=${selectedDate}`),
    enabled: !!selectedDoctorId && !!selectedDate,
  });

  // Book Mutation
  const bookMutation = useMutation({
    mutationFn: (body: any) => api.post<Appointment>('/appointments', body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patient-dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] });
      setBookingSuccess(`Appointment confirmed! Reference: ${data.appointmentReference} (Token #${data.tokenNumber})`);
      setTimeout(() => {
        setIsBookModalOpen(false);
        setBookingSuccess(null);
      }, 1800);
    },
    onError: (err: any) => {
      setBookingError(err.message || 'Failed to book appointment.');
    },
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: (apptId: number) => api.post(`/appointments/${apptId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['patient-dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['patient-timeline'] });
      setCancellingAppt(null);
    },
  });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    bookMutation.mutate({
      doctorId: selectedDoctorId,
      hospitalId: selectedHospitalId,
      appointmentDate: selectedDate,
      startTime: selectedStartTime,
      reasonForVisit,
    });
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'UPCOMING') return a.status === 'BOOKED' || a.status === 'CONFIRMED';
    if (filter === 'COMPLETED') return a.status === 'COMPLETED';
    if (filter === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Appointment Consultations</h1>
          <p className="text-sm text-brand-muted mt-1">
            Book hospital slots, view assigned token numbers, and manage your consultation schedule.
          </p>
        </div>
        <Button
          variant="teal"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setBookingError(null);
            setBookingSuccess(null);
            setIsBookModalOpen(true);
          }}
        >
          Book Consultation
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-brand-border pb-2">
        {(['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              filter === tab
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-brand-muted hover:bg-slate-200 hover:text-brand-navy'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Appointment Cards List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-brand-muted">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <Card className="py-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-brand-navy">No {filter.toLowerCase()} appointments found</h3>
          <p className="text-xs text-brand-muted mt-1">
            Schedule a new visit or select another filter.
          </p>
          <Button
            variant="teal"
            size="sm"
            className="mt-4"
            onClick={() => setIsBookModalOpen(true)}
          >
            Book an Appointment
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAppointments.map((appt) => {
            const isUpcoming = appt.status === 'BOOKED' || appt.status === 'CONFIRMED';
            return (
              <Card key={appt.appointmentId} hoverEffect className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-brand-border">
                    <div>
                      <div className="font-mono text-xs font-bold text-brand-teal">
                        {appt.appointmentReference}
                      </div>
                      <div className="text-xs text-brand-muted mt-0.5">
                        Token #{appt.tokenNumber}
                      </div>
                    </div>
                    <Badge
                      variant={
                        appt.status === 'COMPLETED'
                          ? 'success'
                          : appt.status === 'CANCELLED'
                          ? 'error'
                          : 'info'
                      }
                      size="sm"
                    >
                      {appt.status}
                    </Badge>
                  </div>

                  <div className="mt-3.5 space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-brand-navy">
                      <Stethoscope className="w-4 h-4 text-brand-teal shrink-0" />
                      <span>{appt.doctor.fullName}</span>
                      <span className="text-xs font-normal text-brand-muted">({appt.doctor.specialty})</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-slate-600">
                      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{appt.hospital.name} ({appt.hospital.city})</span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs font-medium text-brand-navy">
                      <Clock className="w-4 h-4 text-brand-teal shrink-0" />
                      <span>
                        {appt.appointmentDate} at {appt.startTime.substring(0, 5)} - {appt.endTime.substring(0, 5)}
                      </span>
                    </div>

                    {appt.reasonForVisit && (
                      <div className="mt-2 text-xs text-brand-muted p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-medium text-slate-700">Reason:</span> {appt.reasonForVisit}
                      </div>
                    )}
                  </div>
                </div>

                {isUpcoming && (
                  <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between">
                    <span className="text-[11px] text-brand-muted">
                      Please arrive 10 min prior to slot.
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancellingAppt(appt)}
                    >
                      Cancel Visit
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Book Appointment Modal */}
      <Dialog
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Schedule Doctor Consultation"
        description="Select hospital, verified doctor, date, and available 30-minute consultation slot."
        maxWidth="lg"
      >
        {bookingSuccess ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-brand-success mx-auto" />
            <h3 className="font-bold text-lg text-brand-navy">{bookingSuccess}</h3>
            <p className="text-xs text-brand-muted">
              Your appointment is recorded in the system and visible on your dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBookSubmit} className="space-y-4">
            {bookingError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-brand-error text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Hospital"
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(Number(e.target.value))}
              >
                {hospitals.map((h) => (
                  <option key={h.hospitalId} value={h.hospitalId}>
                    {h.name} ({h.city})
                  </option>
                ))}
              </Select>

              <Select
                label="Doctor"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              >
                {doctors.map((d) => (
                  <option key={d.doctorId} value={d.doctorId}>
                    {d.fullName} ({d.specialty})
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Appointment Date"
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            {/* Time Slot Picker */}
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-1.5">
                Available 30-Minute Slots
              </label>
              {isSlotsLoading ? (
                <div className="text-xs text-brand-muted py-2">Checking real-time doctor availability...</div>
              ) : availableSlots.length === 0 ? (
                <div className="text-xs text-brand-error py-2">No slots available on this date.</div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-brand-border rounded-xl">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedStartTime.startsWith(slot.startTime.substring(0, 5));
                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedStartTime(slot.startTime)}
                        className={`py-2 px-2.5 rounded-lg text-xs font-semibold text-center border transition ${
                          !slot.available
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-brand-navy text-white border-brand-navy shadow-sm'
                            : 'bg-white text-brand-navy border-brand-border hover:border-brand-teal'
                        }`}
                      >
                        {slot.startTime.substring(0, 5)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <Input
              label="Reason for Visit (Optional)"
              placeholder="e.g. Chest pain follow-up, routine checkup, fatigue"
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsBookModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="teal"
                size="md"
                isLoading={bookMutation.isPending}
              >
                Confirm Booking
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Cancellation Confirmation Dialog */}
      <Dialog
        isOpen={!!cancellingAppt}
        onClose={() => setCancellingAppt(null)}
        title="Confirm Appointment Cancellation"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-brand-muted leading-relaxed">
            Are you sure you want to cancel your appointment with{' '}
            <span className="font-semibold text-brand-navy">
              {cancellingAppt?.doctor.fullName}
            </span>{' '}
            on <span className="font-semibold text-brand-navy">{cancellingAppt?.appointmentDate}</span> at{' '}
            <span className="font-semibold text-brand-navy">
              {cancellingAppt?.startTime.substring(0, 5)}
            </span>?
          </p>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCancellingAppt(null)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              size="md"
              isLoading={cancelMutation.isPending}
              onClick={() => cancellingAppt && cancelMutation.mutate(cancellingAppt.appointmentId)}
            >
              Yes, Cancel Visit
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
