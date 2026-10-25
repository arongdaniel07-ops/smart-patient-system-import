package com.smartpatient.admin.service;

import com.smartpatient.admin.dto.AdminDashboardStatsDto;
import com.smartpatient.appointment.repository.AppointmentRepository;
import com.smartpatient.audit.service.AuditService;
import com.smartpatient.common.exception.ResourceNotFoundException;
import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.doctor.entity.VerificationStatus;
import com.smartpatient.doctor.repository.DoctorRepository;
import com.smartpatient.hospital.repository.HospitalRepository;
import com.smartpatient.notification.service.NotificationService;
import com.smartpatient.patient.repository.PatientRepository;
import com.smartpatient.report.repository.ReportRepository;
import com.smartpatient.user.entity.AccountStatus;
import com.smartpatient.user.entity.User;
import com.smartpatient.user.entity.UserRole;
import com.smartpatient.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReportRepository reportRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public AdminService(UserRepository userRepository,
                        PatientRepository patientRepository,
                        DoctorRepository doctorRepository,
                        HospitalRepository hospitalRepository,
                        AppointmentRepository appointmentRepository,
                        ReportRepository reportRepository,
                        NotificationService notificationService,
                        AuditService auditService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
        this.appointmentRepository = appointmentRepository;
        this.reportRepository = reportRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getStats() {
        AdminDashboardStatsDto dto = new AdminDashboardStatsDto();
        dto.setTotalPatients(patientRepository.count());
        dto.setTotalDoctors(doctorRepository.count());
        dto.setTotalHospitals(hospitalRepository.count());
        dto.setPendingDoctorVerifications(doctorRepository.findByVerificationStatus(VerificationStatus.PENDING).size());
        dto.setTotalAppointments(appointmentRepository.count());
        dto.setTotalReports(reportRepository.count());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers(UserRole role) {
        if (role != null) {
            return userRepository.findByRole(role);
        }
        return userRepository.findAll();
    }

    @Transactional
    public User updateUserStatus(Long adminUserId, Long targetUserId, AccountStatus newStatus) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        user.setAccountStatus(newStatus);
        User saved = userRepository.save(user);

        auditService.log(adminUserId, "UPDATE_USER_STATUS", "USER", targetUserId.toString(), "SUCCESS", "New status: " + newStatus.name());
        return saved;
    }

    @Transactional
    public Doctor approveDoctor(Long adminUserId, Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));

        doctor.setVerificationStatus(VerificationStatus.VERIFIED);
        doctor.getUser().setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(doctor.getUser());
        Doctor saved = doctorRepository.save(doctor);

        notificationService.createNotification(
                doctor.getUser(),
                "VERIFICATION",
                "Doctor Account Approved",
                "Congratulations! Your doctor profile has been verified by the administrator."
        );

        auditService.log(adminUserId, "APPROVE_DOCTOR", "DOCTOR", doctorId.toString(), "SUCCESS", "Approved doctor: " + doctor.getFullName());
        return saved;
    }

    @Transactional
    public Doctor rejectDoctor(Long adminUserId, Long doctorId, String reason) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + doctorId));

        doctor.setVerificationStatus(VerificationStatus.REJECTED);
        Doctor saved = doctorRepository.save(doctor);

        notificationService.createNotification(
                doctor.getUser(),
                "VERIFICATION",
                "Doctor Account Verification Update",
                "Your doctor verification request was not approved. Reason: " + (reason != null ? reason : "Requirements not met.")
        );

        auditService.log(adminUserId, "REJECT_DOCTOR", "DOCTOR", doctorId.toString(), "SUCCESS", "Rejected: " + doctor.getFullName());
        return saved;
    }
}
