package com.smartpatient.report.service;

import com.smartpatient.appointment.entity.Appointment;
import com.smartpatient.appointment.repository.AppointmentRepository;
import com.smartpatient.audit.service.AuditService;
import com.smartpatient.common.exception.AccessDeniedException;
import com.smartpatient.common.exception.BadRequestException;
import com.smartpatient.common.exception.ResourceNotFoundException;
import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.doctor.repository.DoctorRepository;
import com.smartpatient.notification.service.NotificationService;
import com.smartpatient.patient.entity.Patient;
import com.smartpatient.patient.repository.PatientRepository;
import com.smartpatient.report.dto.ReportComparisonRequest;
import com.smartpatient.report.dto.ReportComparisonResultDto;
import com.smartpatient.report.dto.ReportValueDto;
import com.smartpatient.report.entity.Report;
import com.smartpatient.report.entity.ReportType;
import com.smartpatient.report.entity.ReportValue;
import com.smartpatient.report.repository.ReportRepository;
import com.smartpatient.report.repository.ReportValueRepository;
import com.smartpatient.sharing.entity.RecordShare;
import com.smartpatient.sharing.repository.RecordShareRepository;
import com.smartpatient.user.entity.User;
import com.smartpatient.user.entity.UserRole;
import com.smartpatient.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReportValueRepository reportValueRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final RecordShareRepository recordShareRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final Path storageDirectory;

    public ReportService(
            ReportRepository reportRepository,
            ReportValueRepository reportValueRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            RecordShareRepository recordShareRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            AuditService auditService,
            @Value("${app.storage.upload-dir:./storage/uploads}") String uploadDir) {
        this.reportRepository = reportRepository;
        this.reportValueRepository = reportValueRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.recordShareRepository = recordShareRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.storageDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.storageDirectory);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create private upload directory at: " + uploadDir, ex);
        }
    }

    @Transactional
    public Report uploadReport(Long userId, MultipartFile file, String reportTitle, ReportType reportType,
                               LocalDate reportDate, Long targetPatientId, Long doctorId, Long appointmentId,
                               String description, List<ReportValueDto> structuredValues) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a file to upload.");
        }

        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Determine patient
        Patient patient;
        Doctor doctor = null;
        Appointment appointment = null;

        if (uploader.getRole() == UserRole.PATIENT) {
            patient = patientRepository.findByUser_UserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));
            if (doctorId != null) {
                doctor = doctorRepository.findById(doctorId).orElse(null);
            }
        } else if (uploader.getRole() == UserRole.DOCTOR) {
            if (targetPatientId == null) {
                throw new BadRequestException("Target patient ID is required when doctor uploads a report.");
            }
            patient = patientRepository.findById(targetPatientId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found: " + targetPatientId));
            doctor = doctorRepository.findByUser_UserId(userId).orElse(null);
        } else {
            throw new AccessDeniedException("Only patients and doctors can upload reports.");
        }

        if (appointmentId != null) {
            appointment = appointmentRepository.findById(appointmentId).orElse(null);
        }

        // Validate file type
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "report.pdf");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        List<String> allowedExtensions = Arrays.asList(".pdf", ".png", ".jpg", ".jpeg");
        if (!allowedExtensions.contains(extension)) {
            throw new BadRequestException("Unsupported file type (" + extension + "). Only PDF, PNG, and JPEG documents are accepted.");
        }

        // Validate size (max 15MB)
        if (file.getSize() > 15 * 1024 * 1024) {
            throw new BadRequestException("File exceeds maximum allowed size of 15 MB.");
        }

        // Generate safe internal storage key
        String storageKey = UUID.randomUUID().toString() + extension;
        Path targetLocation = this.storageDirectory.resolve(storageKey);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file securely.", ex);
        }

        Report report = new Report(
                patient, uploader, doctor, appointment,
                reportTitle, reportType, reportDate,
                originalFilename, storageKey, file.getContentType(),
                file.getSize(), description
        );

        Report savedReport = reportRepository.save(report);

        // Save structured laboratory values if provided
        if (structuredValues != null && !structuredValues.isEmpty()) {
            for (ReportValueDto valDto : structuredValues) {
                if (valDto.getTestName() != null && valDto.getNumericValue() != null) {
                    ReportValue rVal = new ReportValue(
                            savedReport,
                            valDto.getTestName(),
                            valDto.getNormalizedTestKey() != null ? valDto.getNormalizedTestKey() : valDto.getTestName(),
                            valDto.getNumericValue(),
                            valDto.getUnit() != null ? valDto.getUnit() : "",
                            valDto.getReferenceRangeMin(),
                            valDto.getReferenceRangeMax(),
                            valDto.getInterpretation(),
                            uploader
                    );
                    savedReport.addReportValue(rVal);
                    reportValueRepository.save(rVal);
                }
            }
        }

        auditService.log(userId, "UPLOAD_REPORT", "REPORT", savedReport.getReportId().toString(), "SUCCESS", "Uploaded: " + reportTitle);

        if (uploader.getRole() == UserRole.DOCTOR) {
            notificationService.createNotification(
                    patient.getUser(),
                    "REPORT",
                    "New Report Uploaded",
                    "Dr. " + (doctor != null ? doctor.getFullName() : "Doctor") + " uploaded a " + reportType.name() + " report: " + reportTitle
            );
        }

        return savedReport;
    }

    @Transactional(readOnly = true)
    public List<Report> getPatientReports(Long userId, ReportType reportType) {
        Patient patient = patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));

        if (reportType != null) {
            return reportRepository.findByPatient_PatientIdAndReportTypeAndDeletedAtIsNullOrderByReportDateDesc(
                    patient.getPatientId(), reportType);
        }
        return reportRepository.findByPatient_PatientIdAndDeletedAtIsNullOrderByReportDateDesc(patient.getPatientId());
    }

    @Transactional(readOnly = true)
    public Report getReportById(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));
    }

    @Transactional(readOnly = true)
    public Resource loadReportFileAsResource(Long reportId, Long userId) {
        Report report = getReportById(reportId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Strict authorization check
        boolean authorized = false;

        if (user.getRole() == UserRole.PATIENT) {
            if (report.getPatient().getUser().getUserId().equals(userId)) {
                authorized = true;
            }
        } else if (user.getRole() == UserRole.DOCTOR) {
            Doctor doctor = doctorRepository.findByUser_UserId(userId).orElse(null);
            if (doctor != null) {
                // Check if doctor is associated with this report
                if (report.getDoctor() != null && report.getDoctor().getDoctorId().equals(doctor.getDoctorId())) {
                    authorized = true;
                } else {
                    // Check active record share grant
                    List<RecordShare> activeShares = recordShareRepository.findActiveSharesForDoctorAndPatient(
                            doctor.getDoctorId(), report.getPatient().getPatientId(), LocalDateTime.now());
                    if (!activeShares.isEmpty()) {
                        authorized = true;
                        activeShares.get(0).recordAccess();
                        recordShareRepository.save(activeShares.get(0));
                    }
                }
            }
        } else if (user.getRole() == UserRole.ADMIN) {
            // As per academic prompt: Admin role does not grant unrestricted medical document download
            throw new AccessDeniedException("Administrative role does not permit downloading private medical documents.");
        }

        if (!authorized) {
            auditService.log(userId, "DOWNLOAD_REPORT", "REPORT", reportId.toString(), "DENIED", "Unauthorized download attempt");
            throw new AccessDeniedException("You are not authorized to download or view this medical report.");
        }

        try {
            Path filePath = this.storageDirectory.resolve(report.getStorageKey()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                auditService.log(userId, "DOWNLOAD_REPORT", "REPORT", reportId.toString(), "SUCCESS", "File downloaded: " + report.getOriginalFilename());
                return resource;
            } else {
                throw new ResourceNotFoundException("Report file could not be found on disk.");
            }
        } catch (Exception ex) {
            throw new ResourceNotFoundException("Error loading report file: " + ex.getMessage());
        }
    }

    @Transactional
    public ReportComparisonResultDto compareReports(Long userId, ReportComparisonRequest request) {
        Patient patient = patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));

        Report older = getReportById(request.getOlderReportId());
        Report newer = getReportById(request.getNewerReportId());

        // Validate ownership
        if (!older.getPatient().getPatientId().equals(patient.getPatientId()) ||
            !newer.getPatient().getPatientId().equals(patient.getPatientId())) {
            throw new AccessDeniedException("You can only compare reports belonging to your own medical records.");
        }

        // Ensure chronological order
        if (older.getReportDate().isAfter(newer.getReportDate())) {
            Report temp = older;
            older = newer;
            newer = temp;
        }

        ReportComparisonResultDto result = new ReportComparisonResultDto();
        result.setOlderReportId(older.getReportId());
        result.setOlderReportTitle(older.getReportTitle());
        result.setOlderReportDate(older.getReportDate());
        result.setNewerReportId(newer.getReportId());
        result.setNewerReportTitle(newer.getReportTitle());
        result.setNewerReportDate(newer.getReportDate());

        List<ReportValue> olderValues = reportValueRepository.findByReport_ReportId(older.getReportId());
        List<ReportValue> newerValues = reportValueRepository.findByReport_ReportId(newer.getReportId());

        Map<String, ReportValue> newerMap = new HashMap<>();
        for (ReportValue nv : newerValues) {
            newerMap.put(nv.getNormalizedTestKey(), nv);
        }

        Set<String> matchedKeys = new HashSet<>();

        for (ReportValue ov : olderValues) {
            String key = ov.getNormalizedTestKey();
            if (newerMap.containsKey(key)) {
                matchedKeys.add(key);
                ReportValue nv = newerMap.get(key);

                ReportComparisonResultDto.ComparedTestMetric metric = new ReportComparisonResultDto.ComparedTestMetric();
                metric.setTestName(ov.getTestName());
                metric.setNormalizedTestKey(key);
                metric.setUnit(ov.getUnit());
                metric.setOlderValue(ov.getNumericValue());
                metric.setNewerValue(nv.getNumericValue());

                BigDecimal diff = nv.getNumericValue().subtract(ov.getNumericValue());
                metric.setDifference(diff);

                if (ov.getNumericValue().compareTo(BigDecimal.ZERO) != 0) {
                    BigDecimal pct = diff.divide(ov.getNumericValue(), 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)).setScale(2, RoundingMode.HALF_UP);
                    metric.setPercentageDifference(pct);
                }

                if (diff.compareTo(BigDecimal.ZERO) > 0) {
                    metric.setTrend("INCREASED");
                } else if (diff.compareTo(BigDecimal.ZERO) < 0) {
                    metric.setTrend("DECREASED");
                } else {
                    metric.setTrend("UNCHANGED");
                }

                metric.setReferenceRangeMin(nv.getReferenceRangeMin() != null ? nv.getReferenceRangeMin() : ov.getReferenceRangeMin());
                metric.setReferenceRangeMax(nv.getReferenceRangeMax() != null ? nv.getReferenceRangeMax() : ov.getReferenceRangeMax());

                metric.setOlderStatus(calculateRangeStatus(ov.getNumericValue(), metric.getReferenceRangeMin(), metric.getReferenceRangeMax()));
                metric.setNewerStatus(calculateRangeStatus(nv.getNumericValue(), metric.getReferenceRangeMin(), metric.getReferenceRangeMax()));

                result.getMatchedMetrics().add(metric);
            } else {
                result.getOlderOnlyMetrics().add(toDto(ov));
            }
        }

        for (ReportValue nv : newerValues) {
            if (!matchedKeys.contains(nv.getNormalizedTestKey())) {
                result.getNewerOnlyMetrics().add(toDto(nv));
            }
        }

        auditService.log(userId, "COMPARE_REPORTS", "REPORT", older.getReportId() + "-" + newer.getReportId(), "SUCCESS", "Comparison generated");
        return result;
    }

    private String calculateRangeStatus(BigDecimal val, BigDecimal min, BigDecimal max) {
        if (val == null) return "UNSPECIFIED";
        if (min != null && val.compareTo(min) < 0) return "LOW";
        if (max != null && val.compareTo(max) > 0) return "HIGH";
        if (min != null || max != null) return "NORMAL";
        return "UNSPECIFIED";
    }

    private ReportValueDto toDto(ReportValue rv) {
        ReportValueDto dto = new ReportValueDto();
        dto.setValueId(rv.getValueId());
        dto.setTestName(rv.getTestName());
        dto.setNormalizedTestKey(rv.getNormalizedTestKey());
        dto.setNumericValue(rv.getNumericValue());
        dto.setUnit(rv.getUnit());
        dto.setReferenceRangeMin(rv.getReferenceRangeMin());
        dto.setReferenceRangeMax(rv.getReferenceRangeMax());
        dto.setInterpretation(rv.getInterpretation());
        return dto;
    }
}
