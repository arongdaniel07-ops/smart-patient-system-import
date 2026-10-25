package com.smartpatient.consultation.repository;

import com.smartpatient.consultation.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    Optional<Consultation> findByAppointment_AppointmentId(Long appointmentId);
    List<Consultation> findByPatient_PatientIdOrderByConsultationDateDesc(Long patientId);
    List<Consultation> findByDoctor_DoctorIdOrderByConsultationDateDesc(Long doctorId);
}
