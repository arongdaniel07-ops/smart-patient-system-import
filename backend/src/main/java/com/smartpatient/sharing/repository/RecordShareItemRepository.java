package com.smartpatient.sharing.repository;

import com.smartpatient.sharing.entity.RecordShareItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecordShareItemRepository extends JpaRepository<RecordShareItem, Long> {
    List<RecordShareItem> findByRecordShare_ShareId(Long shareId);
}
