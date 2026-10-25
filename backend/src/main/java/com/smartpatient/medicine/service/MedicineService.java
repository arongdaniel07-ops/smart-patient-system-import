package com.smartpatient.medicine.service;

import com.smartpatient.audit.service.AuditService;
import com.smartpatient.common.exception.AccessDeniedException;
import com.smartpatient.common.exception.ResourceNotFoundException;
import com.smartpatient.medicine.entity.DoseStatus;
import com.smartpatient.medicine.entity.MedicineSchedule;
import com.smartpatient.medicine.repository.MedicineScheduleRepository;
import com.smartpatient.patient.entity.Patient;
import com.smartpatient.patient.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MedicineService {

    private final MedicineScheduleRepository medicineScheduleRepository;
    private final PatientRepository patientRepository;
    private final AuditService auditService;

    public MedicineService(MedicineScheduleRepository medicineScheduleRepository,
                           PatientRepository patientRepository,
                           AuditService auditService) {
        this.medicineScheduleRepository = medicineScheduleRepository;
        this.patientRepository = patientRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<MedicineSchedule> getTodaySchedules(Long userId) {
        Patient patient = patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));
        return medicineScheduleRepository.findTodayDosesForPatient(patient.getPatientId(), LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<MedicineSchedule> getDoseHistory(Long userId, LocalDate startDate, LocalDate endDate) {
        Patient patient = patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));
        if (startDate == null) startDate = LocalDate.now().minusDays(7);
        if (endDate == null) endDate = LocalDate.now();
        return medicineScheduleRepository.findDoseHistoryForPatient(patient.getPatientId(), startDate, endDate);
    }

    @Transactional
    public MedicineSchedule updateDoseStatus(Long scheduleId, Long userId, DoseStatus status) {
        Patient patient = patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));

        MedicineSchedule schedule = medicineScheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine schedule slot not found: " + scheduleId));

        if (!schedule.getPrescription().getPatient().getPatientId().equals(patient.getPatientId())) {
            throw new AccessDeniedException("You do not own this medicine schedule.");
        }

        switch (status) {
            case TAKEN -> schedule.markTaken();
            case MISSED -> schedule.markMissed();
            case PENDING -> schedule.resetPending();
        }

        MedicineSchedule saved = medicineScheduleRepository.save(schedule);
        auditService.log(userId, "UPDATE_DOSE_STATUS", "MEDICINE_SCHEDULE", scheduleId.toString(), "SUCCESS", "Status: " + status.name());

        return saved;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAdherenceSummary(Long userId) {
        Patient patient = patientRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found."));

        LocalDate today = LocalDate.now();
        long totalToday = medicineScheduleRepository.countByPrescription_Patient_PatientIdAndScheduledDate(patient.getPatientId(), today);
        long takenToday = medicineScheduleRepository.countByPrescription_Patient_PatientIdAndScheduledDateAndStatus(patient.getPatientId(), today, DoseStatus.TAKEN);
        long missedToday = medicineScheduleRepository.countByPrescription_Patient_PatientIdAndScheduledDateAndStatus(patient.getPatientId(), today, DoseStatus.MISSED);
        long pendingToday = Math.max(0, totalToday - takenToday - missedToday);

        Map<String, Object> map = new HashMap<>();
        map.put("totalToday", totalToday);
        map.put("takenToday", takenToday);
        map.put("missedToday", missedToday);
        map.put("pendingToday", pendingToday);
        map.put("adherencePercentage", totalToday > 0 ? Math.round(((double) takenToday / totalToday) * 100) : 100);

        return map;
    }
}
