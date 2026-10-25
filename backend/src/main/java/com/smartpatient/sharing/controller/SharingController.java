package com.smartpatient.sharing.controller;

import com.smartpatient.common.response.ApiResponse;
import com.smartpatient.security.UserPrincipal;
import com.smartpatient.sharing.dto.CreateShareRequest;
import com.smartpatient.sharing.dto.RedeemShareRequest;
import com.smartpatient.sharing.entity.RecordShare;
import com.smartpatient.sharing.service.SharingService;
import com.smartpatient.user.entity.UserRole;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shares")
public class SharingController {

    private final SharingService sharingService;

    public SharingController(SharingService sharingService) {
        this.sharingService = sharingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RecordShare>>> getShares(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal.getRole() == UserRole.DOCTOR) {
            List<RecordShare> list = sharingService.getDoctorActiveShares(principal.getUserId());
            return ResponseEntity.ok(ApiResponse.success(list));
        } else {
            List<RecordShare> list = sharingService.getPatientShares(principal.getUserId());
            return ResponseEntity.ok(ApiResponse.success(list));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<RecordShare>> createShare(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateShareRequest request) {
        RecordShare share = sharingService.createShare(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Record sharing grant created successfully.", share));
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<RecordShare>> redeemShare(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RedeemShareRequest request) {
        RecordShare share = sharingService.redeemShareCode(principal.getUserId(), request.getSharingCode());
        return ResponseEntity.ok(ApiResponse.success("Patient records accessed successfully.", share));
    }

    @PostMapping("/{shareId}/revoke")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<RecordShare>> revokeShare(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long shareId) {
        RecordShare revoked = sharingService.revokeShare(shareId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Record access permission revoked immediately.", revoked));
    }
}
