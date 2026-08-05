package com.tourms.packages.service;

import com.tourms.packages.dto.PackageDTO;
import com.tourms.packages.dto.PackageRequest;
import com.tourms.packages.entity.Category;
import com.tourms.packages.entity.TourPackage;
import com.tourms.packages.repository.PackageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PackageService {

    @Autowired
    private PackageRepository packageRepository;

    private static final String UPLOAD_DIR = "uploads/packages";

    // Upload local image file
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }

        // Validate max 5 MB size
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5 MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        if (!ext.equals(".jpg") && !ext.equals(".jpeg") && !ext.equals(".png") && !ext.equals(".webp")) {
            throw new IllegalArgumentException("Invalid file format. Only JPG, JPEG, PNG, and WEBP formats are allowed.");
        }

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String baseName = originalFilename.substring(0, originalFilename.lastIndexOf(".")).replaceAll("[^a-zA-Z0-9_-]", "_");
            String uniqueFilename = baseName + "_" + System.currentTimeMillis() + ext;
            Path filePath = Paths.get(UPLOAD_DIR).resolve(uniqueFilename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/packages/" + uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image file: " + e.getMessage());
        }
    }

    private void deleteLocalImageFile(String imageUrl) {
        if (imageUrl != null && imageUrl.contains("/uploads/packages/")) {
            try {
                String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
                Files.deleteIfExists(filePath);
            } catch (Exception e) {
                System.err.println("Failed to delete local image file: " + e.getMessage());
            }
        }
    }

    // Get all category enum names
    public List<String> getAllCategories() {
        return Arrays.stream(Category.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    // Get all active packages
    public List<PackageDTO> getAllActivePackages() {
        return packageRepository.findByStatus(TourPackage.PackageStatus.ACTIVE)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Get all packages (Admin)
    public List<PackageDTO> getAllPackages() {
        return packageRepository.findAll()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Get featured packages
    public List<PackageDTO> getFeaturedPackages() {
        return packageRepository.findByFeaturedTrueAndStatus(TourPackage.PackageStatus.ACTIVE)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Get package by ID
    public PackageDTO getPackageById(Long id) {
        TourPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        return mapToDTO(pkg);
    }

    // Search packages
    public List<PackageDTO> searchPackages(String keyword, String categoryStr,
                                           BigDecimal minPrice, BigDecimal maxPrice) {
        Category category = null;
        if (categoryStr != null && !categoryStr.trim().isEmpty()) {
            try {
                category = Category.valueOf(categoryStr.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }
        return packageRepository.searchPackages(keyword, category, minPrice, maxPrice)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // Get packages by category
    public List<PackageDTO> getPackagesByCategory(String categoryStr) {
        try {
            Category category = Category.valueOf(categoryStr.trim().toUpperCase());
            return packageRepository.findByCategoryAndStatus(category, TourPackage.PackageStatus.ACTIVE)
                    .stream().map(this::mapToDTO).collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    // Create package (Admin)
    public PackageDTO createPackage(PackageRequest request) {
        TourPackage pkg = new TourPackage();
        mapRequestToEntity(request, pkg);
        TourPackage saved = packageRepository.save(pkg);
        return mapToDTO(saved);
    }

    // Update package (Admin)
    public PackageDTO updatePackage(Long id, PackageRequest request) {
        TourPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        String oldImageUrl = pkg.getImageUrl();
        String newImageUrl = request.getImageUrl();

        if (oldImageUrl != null && newImageUrl != null && !oldImageUrl.equals(newImageUrl)) {
            deleteLocalImageFile(oldImageUrl);
        }

        mapRequestToEntity(request, pkg);
        TourPackage saved = packageRepository.save(pkg);
        return mapToDTO(saved);
    }

    // Delete package (Admin)
    public void deletePackage(Long id) {
        TourPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        deleteLocalImageFile(pkg.getImageUrl());
        packageRepository.delete(pkg);
    }

    // Reduce available slots on successful booking payment
    public PackageDTO reduceAvailableSlots(Long id, Integer count) {
        TourPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        int seatsToReduce = (count != null && count > 0) ? count : 1;
        if (pkg.getAvailableSlots() < seatsToReduce) {
            throw new RuntimeException("Not enough available seats. Only " + pkg.getAvailableSlots() + " seats left.");
        }
        pkg.setAvailableSlots(pkg.getAvailableSlots() - seatsToReduce);
        return mapToDTO(packageRepository.save(pkg));
    }

    // Update package status (Admin)
    public PackageDTO updatePackageStatus(Long id, String status) {
        TourPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Package not found"));
        pkg.setStatus(TourPackage.PackageStatus.valueOf(status));
        return mapToDTO(packageRepository.save(pkg));
    }

    private void mapRequestToEntity(PackageRequest request, TourPackage pkg) {
        pkg.setTitle(request.getTitle());
        pkg.setDescription(request.getDescription());
        pkg.setDestinationsCovered(request.getDestinationsCovered());
        pkg.setDurationDays(request.getDurationDays());
        pkg.setDurationNights(request.getDurationNights());
        pkg.setPrice(request.getPrice());
        pkg.setMaxPersons(request.getMaxPersons());
        pkg.setAvailableSlots(request.getAvailableSlots());
        pkg.setStartDate(request.getStartDate());
        pkg.setEndDate(request.getEndDate());
        pkg.setImageUrl(request.getImageUrl());
        pkg.setHighlights(request.getHighlights());
        pkg.setInclusions(request.getInclusions());
        pkg.setExclusions(request.getExclusions());
        pkg.setFeatured(request.getFeatured());

        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            try {
                pkg.setCategory(Category.valueOf(request.getCategory().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                pkg.setCategory(null);
            }
        } else {
            pkg.setCategory(null);
        }
    }

    private PackageDTO mapToDTO(TourPackage pkg) {
        PackageDTO dto = new PackageDTO();
        dto.setId(pkg.getId());
        dto.setTitle(pkg.getTitle());
        dto.setDescription(pkg.getDescription());
        dto.setCategory(pkg.getCategory() != null ? pkg.getCategory().name() : null);
        dto.setDestinationsCovered(pkg.getDestinationsCovered());
        dto.setDurationDays(pkg.getDurationDays());
        dto.setDurationNights(pkg.getDurationNights());
        dto.setPrice(pkg.getPrice());
        dto.setMaxPersons(pkg.getMaxPersons());
        dto.setAvailableSlots(pkg.getAvailableSlots());
        dto.setStartDate(pkg.getStartDate());
        dto.setEndDate(pkg.getEndDate());
        dto.setImageUrl(pkg.getImageUrl());
        dto.setHighlights(pkg.getHighlights());
        dto.setInclusions(pkg.getInclusions());
        dto.setExclusions(pkg.getExclusions());
        dto.setStatus(pkg.getStatus().name());
        dto.setFeatured(pkg.getFeatured());
        return dto;
    }
}
