package com.smartpatient.hospital.controller;

import com.smartpatient.common.response.ApiResponse;
import com.smartpatient.hospital.entity.Hospital;
import com.smartpatient.hospital.service.HospitalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Hospital>>> getHospitals(@RequestParam(required = false) String search) {
        List<Hospital> hospitals = hospitalService.searchHospitals(search);
        return ResponseEntity.ok(ApiResponse.success(hospitals));
    }

    @GetMapping("/{hospitalId}")
    public ResponseEntity<ApiResponse<Hospital>> getHospitalById(@PathVariable Long hospitalId) {
        Hospital hospital = hospitalService.getHospitalById(hospitalId);
        return ResponseEntity.ok(ApiResponse.success(hospital));
    }
}
