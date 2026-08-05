package com.tourms.enquiry.repository;

import com.tourms.enquiry.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByUserId(Long userId);
    Optional<Wishlist> findByUserIdAndPackageId(Long userId, Long packageId);
    void deleteByUserIdAndPackageId(Long userId, Long packageId);
}
