package com.tourms.enquiry.repository;

import com.tourms.enquiry.entity.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {
    List<Enquiry> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Enquiry> findAllByOrderByCreatedAtDesc();
}
