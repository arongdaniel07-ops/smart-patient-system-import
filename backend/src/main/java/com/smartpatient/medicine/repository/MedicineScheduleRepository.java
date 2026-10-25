package com.smartpatient.medicine.repository;

import com.smartpatient.medicine.entity.DoseStatus;
import com.smartpatient.medicine.entity.MedicineSchedule;
import com.smartpatient.medicine.entity.TimePeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineScheduleRepository extends JpaRepository<MedicineSchedule, Long> {

    @Query("SELECT s FROM MedicineSchedule s WHERE s.prescription.patient.patientId = :patientId " +
           "AND s.scheduledDate = :date ORDER BY s.scheduledTime ASC")
    List<MedicineSchedule> findTodayDosesForPatient(@Param("patientId") Long patientId, @Param("date") LocalDate date);

    @Query("SELECT s FROM MedicineSchedule s WHERE s.prescription.patient.patientId = :patientId " +
           "AND s.scheduledDate BETWEEN :startDate AND :endDate ORDER BY s.scheduledDate DESC, s.scheduledTime ASC")
    List<MedicineSchedule> findDoseHistoryForPatient(@Param("patientId") Long patientId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    Optional<MedicineSchedule> findByPrescription_PrescriptionIdAndScheduledDateAndTimePeriod(
            Long prescriptionId, LocalDate scheduledDate, TimePeriod timePeriod);

    long countByPrescription_Patient_PatientIdAndScheduledDateAndStatus(
            Long patientId, LocalDate date, DoseStatus status);

    long countByPrescription_Patient_PatientIdAndScheduledDate(
            Long patientId, LocalDate date);
}
