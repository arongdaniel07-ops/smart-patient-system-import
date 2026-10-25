package com.smartpatient.report.repository;

import com.smartpatient.report.entity.Report;
import com.smartpatient.report.entity.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByPatient_PatientIdAndDeletedAtIsNullOrderByReportDateDesc(Long patientId);

    List<Report> findByPatient_PatientIdAndReportTypeAndDeletedAtIsNullOrderByReportDateDesc(Long patientId, ReportType reportType);

    @Query("SELECT r FROM Report r WHERE r.patient.patientId = :patientId AND r.deletedAt IS NULL ORDER BY r.reportDate DESC")
    List<Report> findLatestReportsForPatient(@Param("patientId") Long patientId);
}
