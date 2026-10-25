package com.smartpatient.sharing.repository;

import com.smartpatient.sharing.entity.RecordShare;
import com.smartpatient.sharing.entity.ShareStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecordShareRepository extends JpaRepository<RecordShare, Long> {
    List<RecordShare> findByPatient_PatientIdOrderByCreatedAtDesc(Long patientId);
    List<RecordShare> findByDoctor_DoctorIdAndStatusOrderByCreatedAtDesc(Long doctorId, ShareStatus status);
    Optional<RecordShare> findBySharingCode(String sharingCode);

    @Query("SELECT s FROM RecordShare s WHERE s.doctor.doctorId = :doctorId AND s.patient.patientId = :patientId " +
           "AND s.status = 'ACTIVE' AND s.expiresAt > :now AND s.revokedAt IS NULL")
    List<RecordShare> findActiveSharesForDoctorAndPatient(@Param("doctorId") Long doctorId,
                                                          @Param("patientId") Long patientId,
                                                          @Param("now") LocalDateTime now);
}
