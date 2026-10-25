package com.smartpatient.followup.repository;

import com.smartpatient.followup.entity.FollowUp;
import com.smartpatient.followup.entity.FollowUpStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByPatient_PatientIdOrderByFollowUpDateAsc(Long patientId);
    List<FollowUp> findByDoctor_DoctorIdOrderByFollowUpDateAsc(Long doctorId);

    @Query("SELECT f FROM FollowUp f WHERE f.patient.patientId = :patientId AND f.followUpDate >= :today AND f.status = 'UPCOMING' ORDER BY f.followUpDate ASC")
    List<FollowUp> findUpcomingFollowUpsForPatient(@Param("patientId") Long patientId, @Param("today") LocalDate today);

    @Query("SELECT f FROM FollowUp f WHERE f.patient.patientId = :patientId AND f.followUpDate >= :today AND f.status = 'UPCOMING' ORDER BY f.followUpDate ASC")
    Optional<FollowUp> findFirstUpcomingFollowUpForPatient(@Param("patientId") Long patientId, @Param("today") LocalDate today);
}
