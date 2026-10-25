package com.smartpatient.patient.dto;

import java.time.LocalDate;

public class PatientDashboardSummaryDto {
    private String patientCode;
    private String patientName;
    private LocalDate todayDate;

    // Card 1: Upcoming appointment
    private Long upcomingAppointmentId;
    private String upcomingAppointmentDoctor;
    private String upcomingAppointmentSpecialty;
    private String upcomingAppointmentHospital;
    private String upcomingAppointmentDateTime;
    private String upcomingAppointmentReference;

    // Card 2: Latest medical report
    private Long latestReportId;
    private String latestReportTitle;
    private String latestReportType;
    private String latestReportDate;

    // Card 3: Today's medicine progress
    private long totalDosesToday;
    private long takenDosesToday;
    private long missedDosesToday;
    private long pendingDosesToday;

    // Card 4: Next follow-up
    private Long nextFollowUpId;
    private String nextFollowUpDoctor;
    private String nextFollowUpDate;
    private String nextFollowUpReason;

    public PatientDashboardSummaryDto() {
        this.todayDate = LocalDate.now();
    }

    public String getPatientCode() {
        return patientCode;
    }

    public void setPatientCode(String patientCode) {
        this.patientCode = patientCode;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public LocalDate getTodayDate() {
        return todayDate;
    }

    public void setTodayDate(LocalDate todayDate) {
        this.todayDate = todayDate;
    }

    public Long getUpcomingAppointmentId() {
        return upcomingAppointmentId;
    }

    public void setUpcomingAppointmentId(Long upcomingAppointmentId) {
        this.upcomingAppointmentId = upcomingAppointmentId;
    }

    public String getUpcomingAppointmentDoctor() {
        return upcomingAppointmentDoctor;
    }

    public void setUpcomingAppointmentDoctor(String upcomingAppointmentDoctor) {
        this.upcomingAppointmentDoctor = upcomingAppointmentDoctor;
    }

    public String getUpcomingAppointmentSpecialty() {
        return upcomingAppointmentSpecialty;
    }

    public void setUpcomingAppointmentSpecialty(String upcomingAppointmentSpecialty) {
        this.upcomingAppointmentSpecialty = upcomingAppointmentSpecialty;
    }

    public String getUpcomingAppointmentHospital() {
        return upcomingAppointmentHospital;
    }

    public void setUpcomingAppointmentHospital(String upcomingAppointmentHospital) {
        this.upcomingAppointmentHospital = upcomingAppointmentHospital;
    }

    public String getUpcomingAppointmentDateTime() {
        return upcomingAppointmentDateTime;
    }

    public void setUpcomingAppointmentDateTime(String upcomingAppointmentDateTime) {
        this.upcomingAppointmentDateTime = upcomingAppointmentDateTime;
    }

    public String getUpcomingAppointmentReference() {
        return upcomingAppointmentReference;
    }

    public void setUpcomingAppointmentReference(String upcomingAppointmentReference) {
        this.upcomingAppointmentReference = upcomingAppointmentReference;
    }

    public Long getLatestReportId() {
        return latestReportId;
    }

    public void setLatestReportId(Long latestReportId) {
        this.latestReportId = latestReportId;
    }

    public String getLatestReportTitle() {
        return latestReportTitle;
    }

    public void setLatestReportTitle(String latestReportTitle) {
        this.latestReportTitle = latestReportTitle;
    }

    public String getLatestReportType() {
        return latestReportType;
    }

    public void setLatestReportType(String latestReportType) {
        this.latestReportType = latestReportType;
    }

    public String getLatestReportDate() {
        return latestReportDate;
    }

    public void setLatestReportDate(String latestReportDate) {
        this.latestReportDate = latestReportDate;
    }

    public long getTotalDosesToday() {
        return totalDosesToday;
    }

    public void setTotalDosesToday(long totalDosesToday) {
        this.totalDosesToday = totalDosesToday;
    }

    public long getTakenDosesToday() {
        return takenDosesToday;
    }

    public void setTakenDosesToday(long takenDosesToday) {
        this.takenDosesToday = takenDosesToday;
    }

    public long getMissedDosesToday() {
        return missedDosesToday;
    }

    public void setMissedDosesToday(long missedDosesToday) {
        this.missedDosesToday = missedDosesToday;
    }

    public long getPendingDosesToday() {
        return pendingDosesToday;
    }

    public void setPendingDosesToday(long pendingDosesToday) {
        this.pendingDosesToday = pendingDosesToday;
    }

    public Long getNextFollowUpId() {
        return nextFollowUpId;
    }

    public void setNextFollowUpId(Long nextFollowUpId) {
        this.nextFollowUpId = nextFollowUpId;
    }

    public String getNextFollowUpDoctor() {
        return nextFollowUpDoctor;
    }

    public void setNextFollowUpDoctor(String nextFollowUpDoctor) {
        this.nextFollowUpDoctor = nextFollowUpDoctor;
    }

    public String getNextFollowUpDate() {
        return nextFollowUpDate;
    }

    public void setNextFollowUpDate(String nextFollowUpDate) {
        this.nextFollowUpDate = nextFollowUpDate;
    }

    public String getNextFollowUpReason() {
        return nextFollowUpReason;
    }

    public void setNextFollowUpReason(String nextFollowUpReason) {
        this.nextFollowUpReason = nextFollowUpReason;
    }
}
