package com.smartpatient.auth.controller;

import com.smartpatient.auth.dto.AuthResponse;
import com.smartpatient.auth.dto.LoginRequest;
import com.smartpatient.auth.dto.RegisterPatientRequest;
import com.smartpatient.auth.dto.UserSummaryDto;
import com.smartpatient.auth.service.AuthService;
import com.smartpatient.common.response.ApiResponse;
import com.smartpatient.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterPatientRequest request) {
        AuthResponse response = authService.registerPatient(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful. Your Patient ID is " + response.getPatientCode(), response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully.", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        UserSummaryDto user = authService.getCurrentUser(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
