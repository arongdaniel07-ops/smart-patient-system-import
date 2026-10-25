package com.smartpatient.patient.controller;

import com.smartpatient.common.response.ApiResponse;
import com.smartpatient.patient.dto.PatientDashboardSummaryDto;
import com.smartpatient.patient.dto.PatientTimelineEventDto;
import com.smartpatient.patient.entity.Patient;
import com.smartpatient.patient.service.PatientService;
import com.smartpatient.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Patient>> getMyProfile(@AuthenticationPrincipal UserPrincipal principal) {
        Patient patient = patientService.getPatientByUserId(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Patient>> updateMyProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Map<String, String> body) {
        Patient updated = patientService.updateProfile(
                principal.getUserId(),
                body.get("fullName"),
                body.get("phone"),
                body.get("bloodGroup"),
                body.get("allergies"),
                body.get("emergencyContactName"),
                body.get("emergencyContactPhone")
        );
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/me/dashboard")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<PatientDashboardSummaryDto>> getDashboardSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        PatientDashboardSummaryDto summary = patientService.getDashboardSummary(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/me/timeline")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<PatientTimelineEventDto>>> getTimeline(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PatientTimelineEventDto> timeline = patientService.getTimeline(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(timeline));
    }
}
