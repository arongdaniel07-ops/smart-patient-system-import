package com.smartpatient.report.dto;

import java.math.BigDecimal;

public class ReportValueDto {
    private Long valueId;
    private String testName;
    private String normalizedTestKey;
    private BigDecimal numericValue;
    private String unit;
    private BigDecimal referenceRangeMin;
    private BigDecimal referenceRangeMax;
    private String interpretation;

    public ReportValueDto() {}

    public ReportValueDto(String testName, String normalizedTestKey, BigDecimal numericValue,
                          String unit, BigDecimal referenceRangeMin, BigDecimal referenceRangeMax,
                          String interpretation) {
        this.testName = testName;
        this.normalizedTestKey = normalizedTestKey;
        this.numericValue = numericValue;
        this.unit = unit;
        this.referenceRangeMin = referenceRangeMin;
        this.referenceRangeMax = referenceRangeMax;
        this.interpretation = interpretation;
    }

    public Long getValueId() {
        return valueId;
    }

    public void setValueId(Long valueId) {
        this.valueId = valueId;
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
        this.normalizedTestKey = normalizedTestKey;
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
}
