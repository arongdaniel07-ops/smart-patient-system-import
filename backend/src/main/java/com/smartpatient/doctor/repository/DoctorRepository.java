package com.smartpatient.doctor.repository;

import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.doctor.entity.VerificationStatus;
import com.smartpatient.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
    Optional<Doctor> findByUser_UserId(Long userId);
    List<Doctor> findByVerificationStatus(VerificationStatus status);
    List<Doctor> findByHospital_HospitalIdAndVerificationStatus(Long hospitalId, VerificationStatus status);

    @Query("SELECT d FROM Doctor d WHERE d.verificationStatus = :status AND " +
           "(:specialty IS NULL OR LOWER(d.specialty) = LOWER(:specialty)) AND " +
           "(:hospitalId IS NULL OR d.hospital.hospitalId = :hospitalId) AND " +
           "(:search IS NULL OR LOWER(d.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Doctor> searchDoctors(@Param("status") VerificationStatus status,
                               @Param("specialty") String specialty,
                               @Param("hospitalId") Long hospitalId,
                               @Param("search") String search);

    @Query("SELECT DISTINCT d.specialty FROM Doctor d WHERE d.verificationStatus = 'VERIFIED'")
    List<String> findDistinctSpecialties();
}
