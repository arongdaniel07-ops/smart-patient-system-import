package com.smartpatient.hospital.service;

import com.smartpatient.common.exception.ResourceNotFoundException;
import com.smartpatient.hospital.entity.Hospital;
import com.smartpatient.hospital.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    @Transactional(readOnly = true)
    public List<Hospital> getAllActiveHospitals() {
        return hospitalRepository.findByActiveStatusTrue();
    }

    @Transactional(readOnly = true)
    public List<Hospital> searchHospitals(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllActiveHospitals();
        }
        return hospitalRepository.searchHospitals(query.trim());
    }

    @Transactional(readOnly = true)
    public Hospital getHospitalById(Long hospitalId) {
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id: " + hospitalId));
    }

    @Transactional
    public Hospital saveHospital(Hospital hospital) {
        return hospitalRepository.save(hospital);
    }
}
