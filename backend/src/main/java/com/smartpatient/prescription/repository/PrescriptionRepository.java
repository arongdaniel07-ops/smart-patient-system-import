package com.smartpatient.prescription.repository;

import com.smartpatient.prescription.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    List<Prescription> findByPatient_PatientIdOrderByStartDateDesc(Long patientId);
    List<Prescription> findByDoctor_DoctorIdOrderByStartDateDesc(Long doctorId);
    List<Prescription> findByAppointment_AppointmentId(Long appointmentId);
}
