package com.smartpatient.appointment.repository;

import com.smartpatient.appointment.entity.Appointment;
import com.smartpatient.appointment.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    Optional<Appointment> findByAppointmentReference(String reference);

    List<Appointment> findByPatient_PatientIdOrderByAppointmentDateDescStartTimeDesc(Long patientId);

    List<Appointment> findByDoctor_DoctorIdOrderByAppointmentDateDescStartTimeDesc(Long doctorId);

    List<Appointment> findByDoctor_DoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.doctor.doctorId = :doctorId " +
           "AND a.appointmentDate = :date AND a.startTime = :startTime AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    boolean existsActiveSlotBooking(@Param("doctorId") Long doctorId,
                                    @Param("date") LocalDate date,
                                    @Param("startTime") LocalTime startTime);

    @Query("SELECT COALESCE(MAX(a.tokenNumber), 0) FROM Appointment a WHERE a.doctor.doctorId = :doctorId AND a.appointmentDate = :date")
    Integer findMaxTokenForDoctorAndDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.patient.patientId = :patientId AND a.appointmentDate >= :today AND a.status IN ('BOOKED', 'CONFIRMED') ORDER BY a.appointmentDate ASC, a.startTime ASC")
    List<Appointment> findUpcomingAppointmentsForPatient(@Param("patientId") Long patientId, @Param("today") LocalDate today);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.doctorId = :doctorId AND a.appointmentDate = :today AND a.status NOT IN ('CANCELLED') ORDER BY a.startTime ASC")
    List<Appointment> findTodayAppointmentsForDoctor(@Param("doctorId") Long doctorId, @Param("today") LocalDate today);
}
