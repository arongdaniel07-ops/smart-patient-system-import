package com.smartpatient.appointment.service;

import com.smartpatient.appointment.dto.BookAppointmentRequest;
import com.smartpatient.appointment.dto.TimeSlotDto;
import com.smartpatient.appointment.entity.Appointment;
import com.smartpatient.appointment.entity.AppointmentStatus;
import com.smartpatient.appointment.repository.AppointmentRepository;
import com.smartpatient.audit.service.AuditService;
import com.smartpatient.common.exception.BadRequestException;
import com.smartpatient.common.exception.ResourceNotFoundException;
import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.doctor.entity.VerificationStatus;
import com.smartpatient.doctor.repository.DoctorRepository;
import com.smartpatient.hospital.entity.Hospital;
import com.smartpatient.hospital.repository.HospitalRepository;
import com.smartpatient.notification.service.NotificationService;
import com.smartpatient.patient.entity.Patient;
import com.smartpatient.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              HospitalRepository hospitalRepository,
                              NotificationService notificationService,
                              AuditService auditService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<TimeSlotDto> getAvailableSlots(Long doctorId, LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            return Collections.emptyList();
        }

        List<Appointment> existingBookings = appointmentRepository.findByDoctor_DoctorIdAndAppointmentDate(doctorId, date);
        List<TimeSlotDto> slots = new ArrayList<>();

        // Working hours: 09:00 to 17:00, 30 min intervals (Lunch: 13:00 - 14:00)
        LocalTime start = LocalTime.of(9, 0);
        LocalTime end = LocalTime.of(17, 0);

        while (start.isBefore(end)) {
            LocalTime slotEnd = start.plusMinutes(30);
            if (start.getHour() != 13) { // Skip lunch break
                final LocalTime currentSlot = start;
                boolean isBooked = existingBookings.stream()
                        .anyMatch(a -> a.getStartTime().equals(currentSlot) &&
                                       a.getStatus() != AppointmentStatus.CANCELLED &&
                                       a.getStatus() != AppointmentStatus.NO_SHOW);
                slots.add(new TimeSlotDto(start, slotEnd, !isBooked));
            }
            start = slotEnd;
        }

        return slots;
    }

    @Transactional
    public Appointment bookAppointment(Long patientUserId, BookAppointmentRequest request) {
        Patient patient = patientRepository.findByUser_UserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + patientUserId));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        if (doctor.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new BadRequestException("Doctor is not yet verified for bookings.");
        }

        Hospital hospital = hospitalRepository.findById(request.getHospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + request.getHospitalId()));

        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book an appointment for a past date.");
        }

        // Concurrency safeguard: atomic check against active slot bookings
        boolean isSlotBooked = appointmentRepository.existsActiveSlotBooking(
                doctor.getDoctorId(), request.getAppointmentDate(), request.getStartTime());
        if (isSlotBooked) {
            throw new BadRequestException("This appointment slot is already booked. Please choose an available time slot.");
        }

        // Generate unique human-readable reference e.g. APT-20261025-ABCD
        String datePart = request.getAppointmentDate().format(DateTimeFormatter.BASIC_ISO_DATE);
        String randomSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String reference = "APT-" + datePart + "-" + randomSuffix;

        // Next token number for this doctor on this day
        Integer currentMaxToken = appointmentRepository.findMaxTokenForDoctorAndDate(doctor.getDoctorId(), request.getAppointmentDate());
        int tokenNumber = (currentMaxToken != null ? currentMaxToken : 0) + 1;

        LocalTime endTime = request.getStartTime().plusMinutes(30);

        Appointment appointment = new Appointment(
                reference, patient, doctor, hospital,
                request.getAppointmentDate(), request.getStartTime(), endTime,
                tokenNumber, request.getReasonForVisit()
        );

        Appointment saved = appointmentRepository.save(appointment);

        // In-app notifications
        notificationService.createNotification(
                patient.getUser(),
                "APPOINTMENT",
                "Appointment Booked",
                "Your appointment with Dr. " + doctor.getFullName() + " at " + hospital.getName() + " on " + request.getAppointmentDate() + " at " + request.getStartTime() + " is confirmed. Token #" + tokenNumber
        );

        notificationService.createNotification(
                doctor.getUser(),
                "APPOINTMENT",
                "New Appointment Scheduled",
                "Patient " + patient.getFullName() + " booked slot on " + request.getAppointmentDate() + " at " + request.getStartTime() + " (Token #" + tokenNumber + ")"
        );

        auditService.log(patientUserId, "BOOK_APPOINTMENT", "APPOINTMENT", saved.getAppointmentId().toString(), "SUCCESS", "Ref: " + reference);

        return saved;
    }

    @Transactional
    public Appointment cancelAppointment(Long appointmentId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        boolean isPatient = appointment.getPatient().getUser().getUserId().equals(userId);
        boolean isDoctor = appointment.getDoctor().getUser().getUserId().equals(userId);

        if (!isPatient && !isDoctor) {
            throw new BadRequestException("You are not authorized to cancel this appointment.");
        }

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled.");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        Appointment saved = appointmentRepository.save(appointment);

        // Notify other party
        if (isPatient) {
            notificationService.createNotification(
                    appointment.getDoctor().getUser(),
                    "APPOINTMENT",
                    "Appointment Cancelled by Patient",
                    "Patient " + appointment.getPatient().getFullName() + " has cancelled appointment " + appointment.getAppointmentReference()
            );
        } else {
            notificationService.createNotification(
                    appointment.getPatient().getUser(),
                    "APPOINTMENT",
                    "Appointment Cancelled by Doctor",
                    "Dr. " + appointment.getDoctor().getFullName() + " has cancelled appointment " + appointment.getAppointmentReference()
            );
        }

        auditService.log(userId, "CANCEL_APPOINTMENT", "APPOINTMENT", appointmentId.toString(), "SUCCESS", "Cancelled ref: " + appointment.getAppointmentReference());
        return saved;
    }

    @Transactional
    public Appointment completeAppointment(Long appointmentId, Long doctorUserId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (!appointment.getDoctor().getUser().getUserId().equals(doctorUserId)) {
            throw new BadRequestException("Only the assigned doctor can mark this appointment as completed.");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        return appointmentRepository.save(appointment);
    }

    @Transactional(readOnly = true)
    public List<Appointment> getPatientAppointments(Long userId) {
        Patient patient = patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for user: " + userId));
        return appointmentRepository.findByPatient_PatientIdOrderByAppointmentDateDescStartTimeDesc(patient.getPatientId());
    }

    @Transactional(readOnly = true)
    public List<Appointment> getDoctorAppointments(Long doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_UserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user: " + doctorUserId));
        return appointmentRepository.findByDoctor_DoctorIdOrderByAppointmentDateDescStartTimeDesc(doctor.getDoctorId());
    }

    @Transactional(readOnly = true)
    public Appointment getAppointmentById(Long appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
    }
}
