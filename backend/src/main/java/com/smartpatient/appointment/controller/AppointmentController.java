package com.smartpatient.appointment.controller;

import com.smartpatient.appointment.dto.BookAppointmentRequest;
import com.smartpatient.appointment.entity.Appointment;
import com.smartpatient.appointment.service.AppointmentService;
import com.smartpatient.common.response.ApiResponse;
import com.smartpatient.security.UserPrincipal;
import com.smartpatient.user.entity.UserRole;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Appointment>>> getMyAppointments(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal.getRole() == UserRole.DOCTOR) {
            List<Appointment> list = appointmentService.getDoctorAppointments(principal.getUserId());
            return ResponseEntity.ok(ApiResponse.success(list));
        } else {
            List<Appointment> list = appointmentService.getPatientAppointments(principal.getUserId());
            return ResponseEntity.ok(ApiResponse.success(list));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BookAppointmentRequest request) {
        Appointment booked = appointmentService.bookAppointment(principal.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Appointment booked successfully. Token #" + booked.getTokenNumber(), booked));
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<ApiResponse<Appointment>> getAppointmentById(@PathVariable Long appointmentId) {
        Appointment appointment = appointmentService.getAppointmentById(appointmentId);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @PostMapping("/{appointmentId}/cancel")
    public ResponseEntity<ApiResponse<Appointment>> cancelAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long appointmentId) {
        Appointment cancelled = appointmentService.cancelAppointment(appointmentId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", cancelled));
    }

    @PostMapping("/{appointmentId}/complete")
    public ResponseEntity<ApiResponse<Appointment>> completeAppointment(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long appointmentId) {
        Appointment completed = appointmentService.completeAppointment(appointmentId, principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Appointment marked as completed", completed));
    }
}
