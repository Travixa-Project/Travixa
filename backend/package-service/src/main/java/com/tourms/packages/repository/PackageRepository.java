package com.tourms.packages.repository;

import com.tourms.packages.entity.Category;
import com.tourms.packages.entity.TourPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PackageRepository extends JpaRepository<TourPackage, Long> {

    List<TourPackage> findByStatus(TourPackage.PackageStatus status);

    List<TourPackage> findByFeaturedTrueAndStatus(TourPackage.PackageStatus status);

    List<TourPackage> findByCategoryAndStatus(Category category, TourPackage.PackageStatus status);

    @Query("SELECT p FROM TourPackage p WHERE p.status = 'ACTIVE' " +
           "AND (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.destinationsCovered) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:category IS NULL OR p.category = :category) " +
           "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    List<TourPackage> searchPackages(
            @Param("keyword") String keyword,
            @Param("category") Category category,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice);
}
