package com.smartpatient.hospital.repository;

import com.smartpatient.hospital.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findByActiveStatusTrue();

    @Query("SELECT h FROM Hospital h WHERE h.activeStatus = true AND " +
           "(LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(h.city) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Hospital> searchHospitals(@Param("query") String query);
}
