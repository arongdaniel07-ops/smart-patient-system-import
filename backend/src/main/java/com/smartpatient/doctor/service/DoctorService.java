package com.smartpatient.doctor.service;

import com.smartpatient.common.exception.ResourceNotFoundException;
import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.doctor.entity.VerificationStatus;
import com.smartpatient.doctor.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public List<Doctor> getVerifiedDoctors(String specialty, Long hospitalId, String search) {
        String cleanSpecialty = (specialty != null && !specialty.trim().isEmpty() && !specialty.equalsIgnoreCase("ALL"))
                ? specialty.trim() : null;
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return doctorRepository.searchDoctors(VerificationStatus.VERIFIED, cleanSpecialty, hospitalId, cleanSearch);
    }

    @Transactional(readOnly = true)
    public Doctor getDoctorById(Long doctorId) {
        return doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));
    }

    @Transactional(readOnly = true)
    public Doctor getDoctorByUserId(Long userId) {
        return doctorRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for user id: " + userId));
    }

    @Transactional(readOnly = true)
    public List<String> getAllSpecialties() {
        return doctorRepository.findDistinctSpecialties();
    }

    @Transactional(readOnly = true)
    public List<Doctor> getPendingDoctors() {
        return doctorRepository.findByVerificationStatus(VerificationStatus.PENDING);
    }

    @Transactional
    public Doctor updateVerification(Long doctorId, VerificationStatus status) {
        Doctor doctor = getDoctorById(doctorId);
        doctor.setVerificationStatus(status);
        return doctorRepository.save(doctor);
    }

    @Transactional
    public Doctor saveDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }
}
