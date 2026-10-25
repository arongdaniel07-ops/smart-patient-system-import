package com.smartpatient.sharing.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CreateShareRequest {

    private Long doctorId; // Optional if generating a sharing code
    private Integer durationHours = 72; // Default 3 days
    private String categoryScope = "ALL"; // 'ALL', 'LAB', 'SCAN', 'PRESCRIPTION', 'CUSTOM'
    private List<Long> reportIds;
    private List<Long> prescriptionIds;

    public CreateShareRequest() {}

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Integer getDurationHours() {
        return durationHours;
    }

    public void setDurationHours(Integer durationHours) {
        this.durationHours = durationHours;
    }

    public String getCategoryScope() {
        return categoryScope;
    }

    public void setCategoryScope(String categoryScope) {
        this.categoryScope = categoryScope;
    }

    public List<Long> getReportIds() {
        return reportIds;
    }

    public void setReportIds(List<Long> reportIds) {
        this.reportIds = reportIds;
    }

    public List<Long> getPrescriptionIds() {
        return prescriptionIds;
    }

    public void setPrescriptionIds(List<Long> prescriptionIds) {
        this.prescriptionIds = prescriptionIds;
    }
}
