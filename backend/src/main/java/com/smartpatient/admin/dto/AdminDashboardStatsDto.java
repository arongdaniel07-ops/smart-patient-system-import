package com.smartpatient.admin.dto;

public class AdminDashboardStatsDto {
    private long totalPatients;
    private long totalDoctors;
    private long totalHospitals;
    private long pendingDoctorVerifications;
    private long totalAppointments;
    private long totalReports;

    public AdminDashboardStatsDto() {}

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public long getTotalHospitals() {
        return totalHospitals;
    }

    public void setTotalHospitals(long totalHospitals) {
        this.totalHospitals = totalHospitals;
    }

    public long getPendingDoctorVerifications() {
        return pendingDoctorVerifications;
    }

    public void setPendingDoctorVerifications(long pendingDoctorVerifications) {
        this.pendingDoctorVerifications = pendingDoctorVerifications;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }
}
