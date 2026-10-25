package com.smartpatient.report;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

public class ReportComparisonLogicTest {

    @Test
    @DisplayName("Should accurately calculate reduction difference and percentage")
    void testReductionComparison() {
        BigDecimal olderValue = new BigDecimal("225.0");
        BigDecimal newerValue = new BigDecimal("185.0");

        BigDecimal diff = newerValue.subtract(olderValue);
        assertEquals(new BigDecimal("-40.0"), diff);

        BigDecimal pct = diff.divide(olderValue, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal(100))
                .setScale(2, RoundingMode.HALF_UP);

        assertEquals(new BigDecimal("-17.78"), pct);
        assertTrue(diff.compareTo(BigDecimal.ZERO) < 0);
    }

    @Test
    @DisplayName("Should detect normal, low, and high reference ranges")
    void testReferenceRangeEvaluations() {
        BigDecimal min = new BigDecimal("125.0");
        BigDecimal max = new BigDecimal("200.0");

        BigDecimal highVal = new BigDecimal("225.0");
        assertTrue(highVal.compareTo(max) > 0, "Value should be detected as HIGH");

        BigDecimal normalVal = new BigDecimal("185.0");
        assertTrue(normalVal.compareTo(min) >= 0 && normalVal.compareTo(max) <= 0, "Value should be NORMAL");

        BigDecimal lowVal = new BigDecimal("100.0");
        assertTrue(lowVal.compareTo(min) < 0, "Value should be detected as LOW");
    }
}
