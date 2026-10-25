package com.smartpatient.doctor.controller;

import com.smartpatient.appointment.dto.TimeSlotDto;
import com.smartpatient.appointment.entity.Appointment;
import com.smartpatient.appointment.service.AppointmentService;
import com.smartpatient.common.response.ApiResponse;
import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.doctor.service.DoctorService;
import com.smartpatient.security.UserPrincipal;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;

    public DoctorController(DoctorService doctorService, AppointmentService appointmentService) {
        this.doctorService = doctorService;
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false) String search) {
        List<Doctor> doctors = doctorService.getVerifiedDoctors(specialty, hospitalId, search);
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/specialties")
    public ResponseEntity<ApiResponse<List<String>>> getSpecialties() {
        List<String> specialties = doctorService.getAllSpecialties();
        return ResponseEntity.ok(ApiResponse.success(specialties));
    }

    @GetMapping("/{doctorId}")
    public ResponseEntity<ApiResponse<Doctor>> getDoctorById(@PathVariable Long doctorId) {
        Doctor doctor = doctorService.getDoctorById(doctorId);
        return ResponseEntity.ok(ApiResponse.success(doctor));
    }

    @GetMapping("/{doctorId}/slots")
    public ResponseEntity<ApiResponse<List<TimeSlotDto>>> getDoctorSlots(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<TimeSlotDto> slots = appointmentService.getAvailableSlots(doctorId, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    @GetMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Doctor>> getMyDoctorProfile(@AuthenticationPrincipal UserPrincipal principal) {
        Doctor doctor = doctorService.getDoctorByUserId(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(doctor));
    }

    @GetMapping("/me/appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<List<Appointment>>> getMyDoctorAppointments(@AuthenticationPrincipal UserPrincipal principal) {
        List<Appointment> appointments = appointmentService.getDoctorAppointments(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }
}
