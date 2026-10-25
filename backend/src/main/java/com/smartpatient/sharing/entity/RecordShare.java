package com.smartpatient.sharing.entity;

import com.smartpatient.doctor.entity.Doctor;
import com.smartpatient.patient.entity.Patient;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "record_shares")
public class RecordShare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "share_id")
    private Long shareId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "sharing_code", length = 30)
    private String sharingCode;

    @Column(name = "sharing_code_hash", length = 255)
    private String sharingCodeHash;

    @Column(name = "category_scope", nullable = false, length = 100)
    private String categoryScope = "ALL";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ShareStatus status = ShareStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @OneToMany(mappedBy = "recordShare", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<RecordShareItem> items = new ArrayList<>();

    public RecordShare() {}

    public RecordShare(Patient patient, Doctor doctor, String sharingCode, String sharingCodeHash,
                       String categoryScope, LocalDateTime expiresAt) {
        this.patient = patient;
        this.doctor = doctor;
        this.sharingCode = sharingCode;
        this.sharingCodeHash = sharingCodeHash;
        this.categoryScope = categoryScope != null ? categoryScope : "ALL";
        this.status = ShareStatus.ACTIVE;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
    }

    public boolean isValid() {
        if (status != ShareStatus.ACTIVE) return false;
        if (expiresAt != null && LocalDateTime.now().isAfter(expiresAt)) return false;
        return revokedAt == null;
    }

    public void revoke() {
        this.status = ShareStatus.REVOKED;
        this.revokedAt = LocalDateTime.now();
    }

    public void recordAccess() {
        this.lastAccessedAt = LocalDateTime.now();
    }

    public Long getShareId() {
        return shareId;
    }

    public void setShareId(Long shareId) {
        this.shareId = shareId;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public String getSharingCode() {
        return sharingCode;
    }

    public void setSharingCode(String sharingCode) {
        this.sharingCode = sharingCode;
    }

    public String getSharingCodeHash() {
        return sharingCodeHash;
    }

    public void setSharingCodeHash(String sharingCodeHash) {
        this.sharingCodeHash = sharingCodeHash;
    }

    public String getCategoryScope() {
        return categoryScope;
    }

    public void setCategoryScope(String categoryScope) {
        this.categoryScope = categoryScope;
    }

    public ShareStatus getStatus() {
        return status;
    }

    public void setStatus(ShareStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }

    public LocalDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }

    public void setLastAccessedAt(LocalDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }

    public List<RecordShareItem> getItems() {
        return items;
    }

    public void setItems(List<RecordShareItem> items) {
        this.items = items;
    }
}
