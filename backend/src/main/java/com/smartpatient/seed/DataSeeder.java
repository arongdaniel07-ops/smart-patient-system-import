package com.smartpatient.seed;

import com.smartpatient.appointment.entity.Appointment;
import com.smartpatient.appointment.entity.AppointmentStatus;
import com.smartpatient.appointment.repository.AppointmentRepository;
import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.doctor.entity.VerificationStatus;
import com.smartpatient.doctor.repository.DoctorRepository;
import com.smartpatient.followup.entity.FollowUp;
import com.smartpatient.followup.repository.FollowUpRepository;
import com.smartpatient.hospital.entity.Hospital;
import com.smartpatient.hospital.repository.HospitalRepository;
import com.smartpatient.medicine.entity.DoseStatus;
import com.smartpatient.medicine.entity.MedicineSchedule;
import com.smartpatient.medicine.entity.TimePeriod;
import com.smartpatient.medicine.repository.MedicineScheduleRepository;
import com.smartpatient.patient.entity.Patient;
import com.smartpatient.patient.repository.PatientRepository;
import com.smartpatient.prescription.entity.FoodInstruction;
import com.smartpatient.prescription.entity.Prescription;
import com.smartpatient.prescription.repository.PrescriptionRepository;
import com.smartpatient.report.entity.Report;
import com.smartpatient.report.entity.ReportType;
import com.smartpatient.report.entity.ReportValue;
import com.smartpatient.report.repository.ReportRepository;
import com.smartpatient.report.repository.ReportValueRepository;
import com.smartpatient.sharing.entity.RecordShare;
import com.smartpatient.sharing.entity.ShareStatus;
import com.smartpatient.sharing.repository.RecordShareRepository;
import com.smartpatient.user.entity.AccountStatus;
import com.smartpatient.user.entity.User;
import com.smartpatient.user.entity.UserRole;
import com.smartpatient.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final MedicineScheduleRepository medicineScheduleRepository;
    private final FollowUpRepository followUpRepository;
    private final ReportRepository reportRepository;
    private final ReportValueRepository reportValueRepository;
    private final RecordShareRepository recordShareRepository;
    private final PasswordEncoder passwordEncoder;
    private final Path storageDir;

    public DataSeeder(UserRepository userRepository,
                      PatientRepository patientRepository,
                      DoctorRepository doctorRepository,
                      HospitalRepository hospitalRepository,
                      AppointmentRepository appointmentRepository,
                      PrescriptionRepository prescriptionRepository,
                      MedicineScheduleRepository medicineScheduleRepository,
                      FollowUpRepository followUpRepository,
                      ReportRepository reportRepository,
                      ReportValueRepository reportValueRepository,
                      RecordShareRepository recordShareRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${app.storage.upload-dir:./storage/uploads}") String uploadDir) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.hospitalRepository = hospitalRepository;
        this.appointmentRepository = appointmentRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.medicineScheduleRepository = medicineScheduleRepository;
        this.followUpRepository = followUpRepository;
        this.reportRepository = reportRepository;
        this.reportValueRepository = reportValueRepository;
        this.recordShareRepository = recordShareRepository;
        this.passwordEncoder = passwordEncoder;
        this.storageDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        Files.createDirectories(storageDir);

        if (userRepository.existsByUsername("admin")) {
            return; // Already seeded
        }

        System.out.println(">>> SEEDING DEMONSTRATION ACADEMIC DATA FOR SMART PATIENT <<<");

        // 1. Admin
        User adminUser = new User("admin", "admin@smartpatient.edu", passwordEncoder.encode("Admin@123"), UserRole.ADMIN);
        adminUser.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(adminUser);

        // 2. Demonstration Hospitals
        Hospital apollo = new Hospital(
                "Apollo Speciality Hospital",
                "Seaport - Airport Road, Kakkanad",
                "Kochi",
                "+91 484 290 5000",
                "NABH accredited multi-speciality tertiary care hospital specializing in cardiology, oncology, and advanced surgery."
        );
        apollo = hospitalRepository.save(apollo);

        Hospital cityCare = new Hospital(
                "City Care Hospital",
                "College Road, Market Junction",
                "Thiruvalla",
                "+91 469 260 1200",
                "Modern multi-speciality hospital with digital records and specialized departments for general medicine and pediatrics."
        );
        cityCare = hospitalRepository.save(cityCare);

        Hospital metro = new Hospital(
                "Metro General Hospital",
                "Collectorate P.O., K.K. Road",
                "Kottayam",
                "+91 481 256 7890",
                "Comprehensive regional hospital providing 24/7 emergency care, laboratory imaging, and outpatient consultation."
        );
        metro = hospitalRepository.save(metro);

        // 3. Verified Doctor: Dr. Rajesh Sharma (Cardiology)
        User docUser1 = new User("dr.sharma", "dr.sharma@apollo.org", passwordEncoder.encode("Doctor@123"), UserRole.DOCTOR);
        docUser1.setAccountStatus(AccountStatus.ACTIVE);
        docUser1 = userRepository.save(docUser1);

        Doctor doc1 = new Doctor(
                docUser1, apollo, "Dr. Rajesh Sharma", "Cardiology",
                "MBBS, MD (Medicine), DM (Cardiology)", "KMC-DOC-48291"
        );
        doc1.setVerificationStatus(VerificationStatus.VERIFIED);
        doc1 = doctorRepository.save(doc1);

        // 4. Verified Doctor: Dr. Priya Menon (General Medicine)
        User docUser2 = new User("dr.priya", "dr.priya@citycare.org", passwordEncoder.encode("Doctor@123"), UserRole.DOCTOR);
        docUser2.setAccountStatus(AccountStatus.ACTIVE);
        docUser2 = userRepository.save(docUser2);

        Doctor doc2 = new Doctor(
                docUser2, cityCare, "Dr. Priya Menon", "General Medicine",
                "MBBS, MD (Internal Medicine)", "KMC-DOC-59302"
        );
        doc2.setVerificationStatus(VerificationStatus.VERIFIED);
        doc2 = doctorRepository.save(doc2);

        // 5. Pending Doctor: Dr. Anita Nair (Neurology)
        User docUser3 = new User("dr.anita", "dr.anita@neurocare.org", passwordEncoder.encode("Doctor@123"), UserRole.DOCTOR);
        docUser3.setAccountStatus(AccountStatus.PENDING_VERIFICATION);
        docUser3 = userRepository.save(docUser3);

        Doctor doc3 = new Doctor(
                docUser3, metro, "Dr. Anita Nair", "Neurology",
                "MBBS, DM (Neurology)", "KMC-DOC-61029"
        );
        doc3.setVerificationStatus(VerificationStatus.PENDING);
        doc3 = doctorRepository.save(doc3);

        // 6. Sample Patient: Deepak Biju (PT-2026-0001)
        User patientUser = new User("patient1", "deepak.biju@student.edu", passwordEncoder.encode("Patient@123"), UserRole.PATIENT);
        patientUser.setAccountStatus(AccountStatus.ACTIVE);
        patientUser = userRepository.save(patientUser);

        Patient patient = new Patient(
                "PT-2026-0001",
                patientUser,
                "Deepak Biju",
                LocalDate.of(2004, 5, 14),
                "+91 98765 43210",
                "O+",
                "Penicillin, Dust mites",
                "George Biju",
                "+91 94471 23456"
        );
        patient = patientRepository.save(patient);

        // 7. Sample Upcoming Appointment
        LocalDate nextMonday = LocalDate.now().plusDays(2);
        Appointment appt1 = new Appointment(
                "APT-20261027-4821",
                patient, doc1, apollo,
                nextMonday, LocalTime.of(10, 0), LocalTime.of(10, 30),
                1, "Routine cardiovascular evaluation and lipid consultation"
        );
        appointmentRepository.save(appt1);

        // 8. Sample Prescription
        Prescription rx1 = new Prescription(
                patient, doc1, appt1,
                "Atorvastatin", "20 mg", "Oral", "Once daily at bedtime",
                LocalDate.now().minusDays(15), LocalDate.now().plusDays(15),
                FoodInstruction.AFTER_FOOD,
                "Take with water at bedtime. Maintain low sodium diet.",
                LocalDate.now().plusDays(15)
        );
        rx1 = prescriptionRepository.save(rx1);

        // 9. Sample Daily Medicine Schedule for Today
        LocalDate today = LocalDate.now();
        MedicineSchedule doseMorning = new MedicineSchedule(
                rx1, today, LocalTime.of(8, 30), TimePeriod.MORNING, "AFTER FOOD"
        );
        doseMorning.markTaken();
        medicineScheduleRepository.save(doseMorning);

        MedicineSchedule doseEvening = new MedicineSchedule(
                rx1, today, LocalTime.of(20, 30), TimePeriod.EVENING, "AFTER FOOD"
        );
        medicineScheduleRepository.save(doseEvening);

        // 10. Sample Follow-up
        FollowUp fu1 = new FollowUp(
                patient, doc1, appt1,
                LocalDate.now().plusDays(15),
                "Review lipid levels and evaluate dosage response"
        );
        followUpRepository.save(fu1);

        // 11. Create physical mock PDF/text files on disk
        String fileKey1 = "sample-lipid-initial.pdf";
        String fileKey2 = "sample-lipid-followup.pdf";
        Files.writeString(storageDir.resolve(fileKey1), "%PDF-1.4 Demonstration Medical Report - Initial Lipid Profile (30 days ago)");
        Files.writeString(storageDir.resolve(fileKey2), "%PDF-1.4 Demonstration Medical Report - Follow-up Lipid Profile (Recent)");

        // 12. Older Lab Report: Initial Lipid Profile
        Report rep1 = new Report(
                patient, docUser1, doc1, null,
                "Comprehensive Lipid Profile - Initial Evaluation",
                ReportType.LAB,
                LocalDate.now().minusDays(30),
                "Initial_Lipid_Panel_Sep.pdf",
                fileKey1,
                "application/pdf",
                1024L * 145,
                "Baseline fasting blood investigation prior to initiating lipid therapy."
        );
        rep1 = reportRepository.save(rep1);

        // Older structured test values
        ReportValue ov1 = new ReportValue(rep1, "Total Cholesterol", "TOTAL_CHOLESTEROL", new BigDecimal("225.0"), "mg/dL", new BigDecimal("125.0"), new BigDecimal("200.0"), "High", docUser1);
        ReportValue ov2 = new ReportValue(rep1, "HDL Cholesterol", "HDL_CHOLESTEROL", new BigDecimal("38.0"), "mg/dL", new BigDecimal("40.0"), new BigDecimal("60.0"), "Low", docUser1);
        ReportValue ov3 = new ReportValue(rep1, "LDL Cholesterol", "LDL_CHOLESTEROL", new BigDecimal("155.0"), "mg/dL", new BigDecimal("50.0"), new BigDecimal("100.0"), "High", docUser1);
        ReportValue ov4 = new ReportValue(rep1, "Triglycerides", "TRIGLYCERIDES", new BigDecimal("160.0"), "mg/dL", new BigDecimal("50.0"), new BigDecimal("150.0"), "High", docUser1);
        ReportValue ov5 = new ReportValue(rep1, "Fasting Blood Sugar", "FASTING_BLOOD_SUGAR", new BigDecimal("108.0"), "mg/dL", new BigDecimal("70.0"), new BigDecimal("100.0"), "Borderline High", docUser1);
        reportValueRepository.save(ov1);
        reportValueRepository.save(ov2);
        reportValueRepository.save(ov3);
        reportValueRepository.save(ov4);
        reportValueRepository.save(ov5);

        // 13. Newer Lab Report: Follow-up Lipid Profile
        Report rep2 = new Report(
                patient, patientUser, doc1, null,
                "Follow-up Lipid Profile & Glycemic Review",
                ReportType.LAB,
                LocalDate.now().minusDays(2),
                "Followup_Lipid_Panel_Oct.pdf",
                fileKey2,
                "application/pdf",
                1024L * 158,
                "Post-medication progress test demonstrating favorable reduction in cholesterol parameters."
        );
        rep2 = reportRepository.save(rep2);

        // Newer structured test values (shows marked improvements for comparison!)
        ReportValue nv1 = new ReportValue(rep2, "Total Cholesterol", "TOTAL_CHOLESTEROL", new BigDecimal("185.0"), "mg/dL", new BigDecimal("125.0"), new BigDecimal("200.0"), "Normal", patientUser);
        ReportValue nv2 = new ReportValue(rep2, "HDL Cholesterol", "HDL_CHOLESTEROL", new BigDecimal("45.0"), "mg/dL", new BigDecimal("40.0"), new BigDecimal("60.0"), "Normal", patientUser);
        ReportValue nv3 = new ReportValue(rep2, "LDL Cholesterol", "LDL_CHOLESTEROL", new BigDecimal("110.0"), "mg/dL", new BigDecimal("50.0"), new BigDecimal("100.0"), "Borderline Normal", patientUser);
        ReportValue nv4 = new ReportValue(rep2, "Triglycerides", "TRIGLYCERIDES", new BigDecimal("140.0"), "mg/dL", new BigDecimal("50.0"), new BigDecimal("150.0"), "Normal", patientUser);
        ReportValue nv5 = new ReportValue(rep2, "Fasting Blood Sugar", "FASTING_BLOOD_SUGAR", new BigDecimal("95.0"), "mg/dL", new BigDecimal("70.0"), new BigDecimal("100.0"), "Normal", patientUser);
        reportValueRepository.save(nv1);
        reportValueRepository.save(nv2);
        reportValueRepository.save(nv3);
        reportValueRepository.save(nv4);
        reportValueRepository.save(nv5);

        // 14. Active Record Share Grant to Dr. Rajesh Sharma
        RecordShare share1 = new RecordShare(
                patient, doc1, "SH-48K2Q9", "SH-48K2Q9", "ALL",
                LocalDateTime.now().plusDays(14)
        );
        share1.setStatus(ShareStatus.ACTIVE);
        recordShareRepository.save(share1);

        System.out.println(">>> SEEDING COMPLETED SUCCESSFULLY <<<");
    }
}
