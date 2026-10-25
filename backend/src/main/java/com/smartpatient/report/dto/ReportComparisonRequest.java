package com.smartpatient.report.dto;

import jakarta.validation.constraints.NotNull;

public class ReportComparisonRequest {

    @NotNull(message = "Older report ID is required")
    private Long olderReportId;

    @NotNull(message = "Newer report ID is required")
    private Long newerReportId;

    public ReportComparisonRequest() {}

    public ReportComparisonRequest(Long olderReportId, Long newerReportId) {
        this.olderReportId = olderReportId;
        this.newerReportId = newerReportId;
    }

    public Long getOlderReportId() {
        return olderReportId;
    }

    public void setOlderReportId(Long olderReportId) {
        this.olderReportId = olderReportId;
    }

    public Long getNewerReportId() {
        return newerReportId;
    }

    public void setNewerReportId(Long newerReportId) {
        this.newerReportId = newerReportId;
    }
}
