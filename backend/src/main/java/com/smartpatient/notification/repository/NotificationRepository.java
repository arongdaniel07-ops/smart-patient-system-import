package com.smartpatient.notification.repository;

import com.smartpatient.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUser_UserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    long countByUser_UserIdAndIsReadFalse(Long userId);
}
