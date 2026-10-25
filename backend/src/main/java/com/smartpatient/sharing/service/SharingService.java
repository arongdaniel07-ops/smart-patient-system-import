package com.smartpatient.sharing.service;

import com.smartpatient.audit.service.AuditService;
import com.smartpatient.common.exception.AccessDeniedException;
import com.smartpatient.common.exception.BadRequestException;
import com.smartpatient.common.exception.ResourceNotFoundException;
import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.doctor.repository.DoctorRepository;
import com.smartpatient.notification.service.NotificationService;
import com.smartpatient.patient.entity.Patient;
import com.smartpatient.patient.repository.PatientRepository;
import com.smartpatient.sharing.dto.CreateShareRequest;
import com.smartpatient.sharing.entity.RecordShare;
import com.smartpatient.sharing.entity.RecordShareItem;
import com.smartpatient.sharing.entity.ShareStatus;
import com.smartpatient.sharing.repository.RecordShareItemRepository;
import com.smartpatient.sharing.repository.RecordShareRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SharingService {

    private final RecordShareRepository recordShareRepository;
    private final RecordShareItemRepository recordShareItemRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final SecureRandom secureRandom = new SecureRandom();

    public SharingService(RecordShareRepository recordShareRepository,
                          RecordShareItemRepository recordShareItemRepository,
                          PatientRepository patientRepository,
                          DoctorRepository doctorRepository,
                          NotificationService notificationService,
                          AuditService auditService) {
        this.recordShareRepository = recordShareRepository;
        this.recordShareItemRepository = recordShareItemRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public RecordShare createShare(Long patientUserId, CreateShareRequest request) {
        Patient patient = patientRepository.findByUser_UserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));

        Doctor doctor = null;
        if (request.getDoctorId() != null) {
            doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + request.getDoctorId()));
        }

        // Generate cryptographically secure random sharing code e.g. SH-48K2Q9
        String code = generateSecureSharingCode();

        int hours = (request.getDurationHours() != null && request.getDurationHours() > 0)
                ? request.getDurationHours() : 72;
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(hours);

        RecordShare share = new RecordShare(
                patient, doctor, code, code,
                request.getCategoryScope() != null ? request.getCategoryScope() : "ALL",
                expiresAt
        );

        RecordShare savedShare = recordShareRepository.save(share);

        // Save individual item grants if specified
        if (request.getReportIds() != null) {
            for (Long repId : request.getReportIds()) {
                RecordShareItem item = new RecordShareItem(savedShare, "REPORT", repId);
                recordShareItemRepository.save(item);
            }
        }
        if (request.getPrescriptionIds() != null) {
            for (Long rxId : request.getPrescriptionIds()) {
                RecordShareItem item = new RecordShareItem(savedShare, "PRESCRIPTION", rxId);
                recordShareItemRepository.save(item);
            }
        }

        if (doctor != null) {
            notificationService.createNotification(
                    doctor.getUser(),
                    "SHARE",
                    "Patient Record Access Granted",
                    "Patient " + patient.getFullName() + " (" + patient.getPatientCode() + ") has granted you access to their medical records."
            );
        }

        auditService.log(patientUserId, "CREATE_RECORD_SHARE", "RECORD_SHARE", savedShare.getShareId().toString(), "SUCCESS", "Code: " + code);

        return savedShare;
    }

    @Transactional
    public RecordShare redeemShareCode(Long doctorUserId, String code) {
        Doctor doctor = doctorRepository.findByUser_UserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found."));

        RecordShare share = recordShareRepository.findBySharingCode(code.trim().toUpperCase())
                .orElseThrow(() -> new BadRequestException("Invalid or non-existent sharing code."));

        if (!share.isValid()) {
            throw new BadRequestException("This sharing code has expired or was revoked by the patient.");
        }

        // Bind doctor to this share
        share.setDoctor(doctor);
        share.recordAccess();
        RecordShare saved = recordShareRepository.save(share);

        notificationService.createNotification(
                share.getPatient().getUser(),
                "SHARE",
                "Sharing Code Redeemed",
                "Dr. " + doctor.getFullName() + " has accessed your shared medical records."
        );

        auditService.log(doctorUserId, "REDEEM_SHARE_CODE", "RECORD_SHARE", saved.getShareId().toString(), "SUCCESS", "Redeemed by Dr. " + doctor.getFullName());

        return saved;
    }

    @Transactional
    public RecordShare revokeShare(Long shareId, Long patientUserId) {
        Patient patient = patientRepository.findByUser_UserId(patientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));

        RecordShare share = recordShareRepository.findById(shareId)
                .orElseThrow(() -> new ResourceNotFoundException("Record share not found: " + shareId));

        if (!share.getPatient().getPatientId().equals(patient.getPatientId())) {
            throw new AccessDeniedException("You are not authorized to revoke this sharing grant.");
        }

        share.revoke();
        RecordShare saved = recordShareRepository.save(share);

        if (share.getDoctor() != null) {
            notificationService.createNotification(
                    share.getDoctor().getUser(),
                    "SHARE",
                    "Record Access Revoked",
                    "Patient " + patient.getFullName() + " has revoked medical record access."
            );
        }

        auditService.log(patientUserId, "REVOKE_RECORD_SHARE", "RECORD_SHARE", shareId.toString(), "SUCCESS", "Revoked share ID: " + shareId);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<RecordShare> getPatientShares(Long userId) {
        Patient patient = patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));
        return recordShareRepository.findByPatient_PatientIdOrderByCreatedAtDesc(patient.getPatientId());
    }

    @Transactional(readOnly = true)
    public List<RecordShare> getDoctorActiveShares(Long doctorUserId) {
        Doctor doctor = doctorRepository.findByUser_UserId(doctorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found."));
        return recordShareRepository.findByDoctor_DoctorIdAndStatusOrderByCreatedAtDesc(doctor.getDoctorId(), ShareStatus.ACTIVE);
    }

    private String generateSecureSharingCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder("SH-");
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
