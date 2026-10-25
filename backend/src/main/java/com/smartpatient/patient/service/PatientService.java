package com.smartpatient.patient.service;

import com.smartpatient.appointment.entity.Appointment;
import com.smartpatient.appointment.repository.AppointmentRepository;
import com.smartpatient.common.exception.ResourceNotFoundException;
import com.smartpatient.consultation.entity.Consultation;
import com.smartpatient.consultation.repository.ConsultationRepository;
import com.smartpatient.followup.entity.FollowUp;
import com.smartpatient.followup.repository.FollowUpRepository;
import com.smartpatient.medicine.entity.DoseStatus;
import com.smartpatient.medicine.entity.MedicineSchedule;
import com.smartpatient.medicine.repository.MedicineScheduleRepository;
import com.smartpatient.patient.dto.PatientDashboardSummaryDto;
import com.smartpatient.patient.dto.PatientTimelineEventDto;
import com.smartpatient.patient.entity.Patient;
import com.smartpatient.patient.repository.PatientRepository;
import com.smartpatient.prescription.entity.Prescription;
import com.smartpatient.prescription.repository.PrescriptionRepository;
import com.smartpatient.report.entity.Report;
import com.smartpatient.report.repository.ReportRepository;
import com.smartpatient.sharing.entity.RecordShare;
import com.smartpatient.sharing.repository.RecordShareRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReportRepository reportRepository;
    private final MedicineScheduleRepository medicineScheduleRepository;
    private final FollowUpRepository followUpRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ConsultationRepository consultationRepository;
    private final RecordShareRepository recordShareRepository;

    public PatientService(PatientRepository patientRepository,
                          AppointmentRepository appointmentRepository,
                          ReportRepository reportRepository,
                          MedicineScheduleRepository medicineScheduleRepository,
                          FollowUpRepository followUpRepository,
                          PrescriptionRepository prescriptionRepository,
                          ConsultationRepository consultationRepository,
                          RecordShareRepository recordShareRepository) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.reportRepository = reportRepository;
        this.medicineScheduleRepository = medicineScheduleRepository;
        this.followUpRepository = followUpRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.consultationRepository = consultationRepository;
        this.recordShareRepository = recordShareRepository;
    }

    @Transactional(readOnly = true)
    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user id: " + userId));
    }

    @Transactional(readOnly = true)
    public Patient getPatientById(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));
    }

    @Transactional
    public Patient updateProfile(Long userId, String fullName, String phone, String bloodGroup,
                                 String allergies, String emergencyContactName, String emergencyContactPhone) {
        Patient patient = getPatientByUserId(userId);
        if (fullName != null) patient.setFullName(fullName);
        if (phone != null) patient.setPhone(phone);
        if (bloodGroup != null) patient.setBloodGroup(bloodGroup);
        if (allergies != null) patient.setAllergies(allergies);
        if (emergencyContactName != null) patient.setEmergencyContactName(emergencyContactName);
        if (emergencyContactPhone != null) patient.setEmergencyContactPhone(emergencyContactPhone);
        return patientRepository.save(patient);
    }

    @Transactional(readOnly = true)
    public PatientDashboardSummaryDto getDashboardSummary(Long userId) {
        Patient patient = getPatientByUserId(userId);
        PatientDashboardSummaryDto dto = new PatientDashboardSummaryDto();
        dto.setPatientCode(patient.getPatientCode());
        dto.setPatientName(patient.getFullName());

        LocalDate today = LocalDate.now();

        // 1. Upcoming Appointment
        List<Appointment> upcoming = appointmentRepository.findUpcomingAppointmentsForPatient(patient.getPatientId(), today);
        if (!upcoming.isEmpty()) {
            Appointment nextAppt = upcoming.get(0);
            dto.setUpcomingAppointmentId(nextAppt.getAppointmentId());
            dto.setUpcomingAppointmentDoctor(nextAppt.getDoctor().getFullName());
            dto.setUpcomingAppointmentSpecialty(nextAppt.getDoctor().getSpecialty());
            dto.setUpcomingAppointmentHospital(nextAppt.getHospital().getName());
            dto.setUpcomingAppointmentReference(nextAppt.getAppointmentReference());
            dto.setUpcomingAppointmentDateTime(nextAppt.getAppointmentDate().toString() + " at " + nextAppt.getStartTime().toString());
        }

        // 2. Latest Report
        List<Report> latestReports = reportRepository.findLatestReportsForPatient(patient.getPatientId());
        if (!latestReports.isEmpty()) {
            Report r = latestReports.get(0);
            dto.setLatestReportId(r.getReportId());
            dto.setLatestReportTitle(r.getReportTitle());
            dto.setLatestReportType(r.getReportType().name());
            dto.setLatestReportDate(r.getReportDate().toString());
        }

        // 3. Medicine Progress Today
        long totalDoses = medicineScheduleRepository.countByPrescription_Patient_PatientIdAndScheduledDate(patient.getPatientId(), today);
        long takenDoses = medicineScheduleRepository.countByPrescription_Patient_PatientIdAndScheduledDateAndStatus(patient.getPatientId(), today, DoseStatus.TAKEN);
        long missedDoses = medicineScheduleRepository.countByPrescription_Patient_PatientIdAndScheduledDateAndStatus(patient.getPatientId(), today, DoseStatus.MISSED);
        dto.setTotalDosesToday(totalDoses);
        dto.setTakenDosesToday(takenDoses);
        dto.setMissedDosesToday(missedDoses);
        dto.setPendingDosesToday(Math.max(0, totalDoses - takenDoses - missedDoses));

        // 4. Next Follow-up
        List<FollowUp> followUps = followUpRepository.findUpcomingFollowUpsForPatient(patient.getPatientId(), today);
        if (!followUps.isEmpty()) {
            FollowUp fu = followUps.get(0);
            dto.setNextFollowUpId(fu.getFollowUpId());
            dto.setNextFollowUpDoctor(fu.getDoctor().getFullName());
            dto.setNextFollowUpDate(fu.getFollowUpDate().toString());
            dto.setNextFollowUpReason(fu.getReason());
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<PatientTimelineEventDto> getTimeline(Long userId) {
        Patient patient = getPatientByUserId(userId);
        Long patientId = patient.getPatientId();
        List<PatientTimelineEventDto> events = new ArrayList<>();

        // Account registration event
        events.add(new PatientTimelineEventDto(
                "reg-" + patient.getPatientId(),
                "REGISTRATION",
                "Patient Account Created",
                "Digital health profile initialized with unique ID " + patient.getPatientCode(),
                patient.getCreatedAt(),
                "primary"
        ));

        // Appointments
        List<Appointment> appts = appointmentRepository.findByPatient_PatientIdOrderByAppointmentDateDescStartTimeDesc(patientId);
        for (Appointment a : appts) {
            String badge = switch (a.getStatus()) {
                case COMPLETED -> "success";
                case CANCELLED -> "error";
                default -> "info";
            };
            events.add(new PatientTimelineEventDto(
                    "appt-" + a.getAppointmentId(),
                    "APPOINTMENT_" + a.getStatus().name(),
                    "Appointment " + a.getStatus().name().toLowerCase() + " (" + a.getAppointmentReference() + ")",
                    "With Dr. " + a.getDoctor().getFullName() + " (" + a.getDoctor().getSpecialty() + ") at " + a.getHospital().getName() + " on " + a.getAppointmentDate() + " at " + a.getStartTime(),
                    a.getCreatedAt(),
                    badge
            ));
        }

        // Consultations
        List<Consultation> consults = consultationRepository.findByPatient_PatientIdOrderByConsultationDateDesc(patientId);
        for (Consultation c : consults) {
            events.add(new PatientTimelineEventDto(
                    "consult-" + c.getConsultationId(),
                    "CONSULTATION",
                    "Consultation Note Recorded",
                    "Dr. " + c.getDoctor().getFullName() + " added clinical encounter notes: " + (c.getNotes().length() > 80 ? c.getNotes().substring(0, 80) + "..." : c.getNotes()),
                    c.getCreatedAt(),
                    "primary"
            ));
        }

        // Prescriptions
        List<Prescription> prescriptions = prescriptionRepository.findByPatient_PatientIdOrderByStartDateDesc(patientId);
        for (Prescription p : prescriptions) {
            events.add(new PatientTimelineEventDto(
                    "rx-" + p.getPrescriptionId(),
                    "PRESCRIPTION",
                    "Prescription Added: " + p.getMedicine(),
                    "Dosage: " + p.getDosage() + ", " + p.getFrequency() + " (" + p.getFoodInstruction() + ") prescribed by Dr. " + p.getDoctor().getFullName(),
                    p.getCreatedAt(),
                    "success"
            ));
        }

        // Reports
        List<Report> reports = reportRepository.findByPatient_PatientIdAndDeletedAtIsNullOrderByReportDateDesc(patientId);
        for (Report r : reports) {
            events.add(new PatientTimelineEventDto(
                    "rep-" + r.getReportId(),
                    "REPORT_" + r.getReportType().name(),
                    r.getReportType().name() + " Report Uploaded: " + r.getReportTitle(),
                    "Document dated " + r.getReportDate() + " (" + r.getOriginalFilename() + ")",
                    r.getCreatedAt(),
                    "info"
            ));
        }

        // Follow-ups
        List<FollowUp> followUps = followUpRepository.findByPatient_PatientIdOrderByFollowUpDateAsc(patientId);
        for (FollowUp f : followUps) {
            events.add(new PatientTimelineEventDto(
                    "fu-" + f.getFollowUpId(),
                    "FOLLOW_UP",
                    "Follow-up Scheduled for " + f.getFollowUpDate(),
                    "Recommended by Dr. " + f.getDoctor().getFullName() + ": " + f.getReason(),
                    f.getCreatedAt(),
                    "warning"
            ));
        }

        // Record Shares
        List<RecordShare> shares = recordShareRepository.findByPatient_PatientIdOrderByCreatedAtDesc(patientId);
        for (RecordShare s : shares) {
            String target = s.getDoctor() != null ? "Dr. " + s.getDoctor().getFullName() : "Sharing Code " + s.getSharingCode();
            events.add(new PatientTimelineEventDto(
                    "share-" + s.getShareId(),
                    "RECORD_SHARE",
                    "Record Access Granted to " + target,
                    "Scope: " + s.getCategoryScope() + " (Status: " + s.getStatus().name() + ", Expires: " + s.getExpiresAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) + ")",
                    s.getCreatedAt(),
                    s.getStatus().name().equals("ACTIVE") ? "success" : "info"
            ));
        }

        Collections.sort(events);
        return events;
    }
}
