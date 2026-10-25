package com.smartpatient.medicine.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.smartpatient.prescription.entity.Prescription;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "medicine_schedules", uniqueConstraints = {
    @UniqueConstraint(name = "uq_medicine_slot", columnNames = {"prescription_id", "scheduled_date", "time_period"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MedicineSchedule {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_id")
    private Long scheduleId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "scheduled_time", nullable = false)
    private LocalTime scheduledTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_period", nullable = false, length = 30)
    private TimePeriod timePeriod;

    @Column(name = "food_instruction", nullable = false, length = 50)
    private String foodInstruction;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DoseStatus status = DoseStatus.PENDING;

    @Column(name = "status_updated_at")
    private LocalDateTime statusUpdatedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public MedicineSchedule() {}

    public MedicineSchedule(Prescription prescription, LocalDate scheduledDate, LocalTime scheduledTime,
                            TimePeriod timePeriod, String foodInstruction) {
        this.prescription = prescription;
        this.scheduledDate = scheduledDate;
        this.scheduledTime = scheduledTime;
        this.timePeriod = timePeriod;
        this.foodInstruction = foodInstruction;
        this.status = DoseStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public void markTaken() {
        this.status = DoseStatus.TAKEN;
        this.statusUpdatedAt = LocalDateTime.now();
    }

    public void markMissed() {
        this.status = DoseStatus.MISSED;
        this.statusUpdatedAt = LocalDateTime.now();
    }

    public void resetPending() {
        this.status = DoseStatus.PENDING;
        this.statusUpdatedAt = LocalDateTime.now();
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Long scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public LocalTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public TimePeriod getTimePeriod() {
        return timePeriod;
    }

    public void setTimePeriod(TimePeriod timePeriod) {
        this.timePeriod = timePeriod;
    }

    public String getFoodInstruction() {
        return foodInstruction;
    }

    public void setFoodInstruction(String foodInstruction) {
        this.foodInstruction = foodInstruction;
    }

    public DoseStatus getStatus() {
        return status;
    }

    public void setStatus(DoseStatus status) {
        this.status = status;
    }

    public LocalDateTime getStatusUpdatedAt() {
        return statusUpdatedAt;
    }

    public void setStatusUpdatedAt(LocalDateTime statusUpdatedAt) {
        this.statusUpdatedAt = statusUpdatedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
