package com.smartpatient.patient.repository;

import com.smartpatient.patient.entity.Patient;
import com.smartpatient.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUser(User user);
    Optional<Patient> findByUser_UserId(Long userId);
    Optional<Patient> findByPatientCode(String patientCode);
    boolean existsByPatientCode(String patientCode);
}
