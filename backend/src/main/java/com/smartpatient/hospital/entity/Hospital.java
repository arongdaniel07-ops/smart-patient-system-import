package com.smartpatient.hospital.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hospital_id")
    private Long hospitalId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 30)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "digital_reports_supported")
    private Boolean digitalReportsSupported = true;

    @Column(name = "application_booking_supported")
    private Boolean applicationBookingSupported = true;

    @Column(name = "active_status")
    private Boolean activeStatus = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Hospital() {}

    public Hospital(String name, String address, String city, String phone, String description) {
        this.name = name;
        this.address = address;
        this.city = city;
        this.phone = phone;
        this.description = description;
        this.digitalReportsSupported = true;
        this.applicationBookingSupported = true;
        this.activeStatus = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getHospitalId() {
        return hospitalId;
    }

    public void setHospitalId(Long hospitalId) {
        this.hospitalId = hospitalId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getDigitalReportsSupported() {
        return digitalReportsSupported;
    }

    public void setDigitalReportsSupported(Boolean digitalReportsSupported) {
        this.digitalReportsSupported = digitalReportsSupported;
    }

    public Boolean getApplicationBookingSupported() {
        return applicationBookingSupported;
    }

    public void setApplicationBookingSupported(Boolean applicationBookingSupported) {
        this.applicationBookingSupported = applicationBookingSupported;
    }

    public Boolean getActiveStatus() {
        return activeStatus;
    }

    public void setActiveStatus(Boolean activeStatus) {
        this.activeStatus = activeStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
