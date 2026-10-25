package com.smartpatient.sharing.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "record_share_items")
public class RecordShareItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "share_id", nullable = false)
    @JsonIgnore
    private RecordShare recordShare;

    @Column(name = "item_type", nullable = false, length = 30)
    private String itemType; // 'REPORT', 'PRESCRIPTION', 'APPOINTMENT'

    @Column(name = "item_reference_id", nullable = false)
    private Long itemReferenceId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public RecordShareItem() {}

    public RecordShareItem(RecordShare recordShare, String itemType, Long itemReferenceId) {
        this.recordShare = recordShare;
        this.itemType = itemType;
        this.itemReferenceId = itemReferenceId;
        this.createdAt = LocalDateTime.now();
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public RecordShare getRecordShare() {
        return recordShare;
    }

    public void setRecordShare(RecordShare recordShare) {
        this.recordShare = recordShare;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public Long getItemReferenceId() {
        return itemReferenceId;
    }

    public void setItemReferenceId(Long itemReferenceId) {
        this.itemReferenceId = itemReferenceId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
