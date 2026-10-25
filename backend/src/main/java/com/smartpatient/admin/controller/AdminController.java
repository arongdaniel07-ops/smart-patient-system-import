package com.smartpatient.admin.controller;

import com.smartpatient.admin.dto.AdminDashboardStatsDto;
import com.smartpatient.admin.service.AdminService;
import com.smartpatient.audit.entity.AuditLog;
import com.smartpatient.audit.service.AuditService;
import com.smartpatient.common.response.ApiResponse;
import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.doctor.service.DoctorService;
import com.smartpatient.hospital.entity.Hospital;
import com.smartpatient.hospital.service.HospitalService;
import com.smartpatient.security.UserPrincipal;
import com.smartpatient.user.entity.AccountStatus;
import com.smartpatient.user.entity.User;
import com.smartpatient.user.entity.UserRole;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final DoctorService doctorService;
    private final HospitalService hospitalService;
    private final AuditService auditService;

    public AdminController(AdminService adminService,
                           DoctorService doctorService,
                           HospitalService hospitalService,
                           AuditService auditService) {
        this.adminService = adminService;
        this.doctorService = doctorService;
        this.hospitalService = hospitalService;
        this.auditService = auditService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getStats() {
        AdminDashboardStatsDto stats = adminService.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers(@RequestParam(required = false) UserRole role) {
        List<User> users = adminService.getAllUsers(role);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        AccountStatus status = AccountStatus.valueOf(body.get("status").toUpperCase());
        User updated = adminService.updateUserStatus(principal.getUserId(), userId, status);
        return ResponseEntity.ok(ApiResponse.success("User status updated to " + status.name(), updated));
    }

    @GetMapping("/doctors/pending")
    public ResponseEntity<ApiResponse<List<Doctor>>> getPendingDoctors() {
        List<Doctor> pending = doctorService.getPendingDoctors();
        return ResponseEntity.ok(ApiResponse.success(pending));
    }

    @PostMapping("/doctors/{doctorId}/approve")
    public ResponseEntity<ApiResponse<Doctor>> approveDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long doctorId) {
        Doctor approved = adminService.approveDoctor(principal.getUserId(), doctorId);
        return ResponseEntity.ok(ApiResponse.success("Doctor approved successfully", approved));
    }

    @PostMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<ApiResponse<Doctor>> rejectDoctor(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long doctorId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : "Documentation insufficient.";
        Doctor rejected = adminService.rejectDoctor(principal.getUserId(), doctorId, reason);
        return ResponseEntity.ok(ApiResponse.success("Doctor application rejected", rejected));
    }

    @PostMapping("/hospitals")
    public ResponseEntity<ApiResponse<Hospital>> createHospital(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody Hospital hospital) {
        Hospital saved = hospitalService.saveHospital(hospital);
        auditService.log(principal.getUserId(), "CREATE_HOSPITAL", "HOSPITAL", saved.getHospitalId().toString(), "SUCCESS", saved.getName());
        return ResponseEntity.ok(ApiResponse.success("Hospital added successfully", saved));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        List<AuditLog> logs = auditService.getRecentLogs();
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
