package com.smartpatient.report.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.smartpatient.user.entity.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_values")
public class ReportValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "value_id")
    private Long valueId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    @JsonIgnore
    private Report report;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @Column(name = "normalized_test_key", nullable = false, length = 100)
    private String normalizedTestKey;

    @Column(name = "numeric_value", nullable = false, precision = 10, scale = 3)
    private BigDecimal numericValue;

    @Column(nullable = false, length = 50)
    private String unit;

    @Column(name = "reference_range_min", precision = 10, scale = 3)
    private BigDecimal referenceRangeMin;

    @Column(name = "reference_range_max", precision = 10, scale = 3)
    private BigDecimal referenceRangeMax;

    @Column(length = 100)
    private String interpretation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entered_by_user_id", nullable = false)
    @JsonIgnore
    private User enteredByUser;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ReportValue() {}

    public ReportValue(Report report, String testName, String normalizedTestKey, BigDecimal numericValue,
                       String unit, BigDecimal referenceRangeMin, BigDecimal referenceRangeMax,
                       String interpretation, User enteredByUser) {
        this.report = report;
        this.testName = testName;
        this.normalizedTestKey = normalizedTestKey.trim().toUpperCase().replaceAll("\\s+", "_");
        this.numericValue = numericValue;
        this.unit = unit;
        this.referenceRangeMin = referenceRangeMin;
        this.referenceRangeMax = referenceRangeMax;
        this.interpretation = interpretation;
        this.enteredByUser = enteredByUser;
        this.createdAt = LocalDateTime.now();
    }

    public Long getValueId() {
        return valueId;
    }

    public void setValueId(Long valueId) {
        this.valueId = valueId;
    }

    public Report getReport() {
        return report;
    }

    public void setReport(Report report) {
        this.report = report;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public String getNormalizedTestKey() {
        return normalizedTestKey;
    }

    public void setNormalizedTestKey(String normalizedTestKey) {
        this.normalizedTestKey = normalizedTestKey != null ? normalizedTestKey.trim().toUpperCase().replaceAll("\\s+", "_") : null;
    }

    public BigDecimal getNumericValue() {
        return numericValue;
    }

    public void setNumericValue(BigDecimal numericValue) {
        this.numericValue = numericValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getReferenceRangeMin() {
        return referenceRangeMin;
    }

    public void setReferenceRangeMin(BigDecimal referenceRangeMin) {
        this.referenceRangeMin = referenceRangeMin;
    }

    public BigDecimal getReferenceRangeMax() {
        return referenceRangeMax;
    }

    public void setReferenceRangeMax(BigDecimal referenceRangeMax) {
        this.referenceRangeMax = referenceRangeMax;
    }

    public String getInterpretation() {
        return interpretation;
    }

    public void setInterpretation(String interpretation) {
        this.interpretation = interpretation;
    }

    public User getEnteredByUser() {
        return enteredByUser;
    }

    public void setEnteredByUser(User enteredByUser) {
        this.enteredByUser = enteredByUser;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
