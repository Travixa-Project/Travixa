package com.tourms.packages.controller;

import com.tourms.packages.dto.PackageDTO;
import com.tourms.packages.dto.PackageRequest;
import com.tourms.packages.service.PackageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
public class PackageController {

    @Autowired
    private PackageService packageService;

    // Admin: Upload local package image
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("image") MultipartFile image) {
        String imageUrl = packageService.uploadImage(image);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    // Public: Get all category enum names
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(packageService.getAllCategories());
    }

    // Public: Get all active packages
    @GetMapping
    public ResponseEntity<List<PackageDTO>> getAllActivePackages() {
        return ResponseEntity.ok(packageService.getAllActivePackages());
    }

    // Public: Get featured packages
    @GetMapping("/featured")
    public ResponseEntity<List<PackageDTO>> getFeaturedPackages() {
        return ResponseEntity.ok(packageService.getFeaturedPackages());
    }

    // Public: Get package by ID
    @GetMapping("/{id}")
    public ResponseEntity<PackageDTO> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    // Public: Search packages
    @GetMapping("/search")
    public ResponseEntity<List<PackageDTO>> searchPackages(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return ResponseEntity.ok(packageService.searchPackages(keyword, category, minPrice, maxPrice));
    }

    // Public: Get by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<PackageDTO>> getPackagesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(packageService.getPackagesByCategory(category));
    }

    // Admin: Get all packages including inactive
    @GetMapping("/admin/all")
    public ResponseEntity<List<PackageDTO>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    // Admin: Create package
    @PostMapping
    public ResponseEntity<PackageDTO> createPackage(@Valid @RequestBody PackageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(packageService.createPackage(request));
    }

    // Admin: Update package
    @PutMapping("/{id}")
    public ResponseEntity<PackageDTO> updatePackage(
            @PathVariable Long id,
            @Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(packageService.updatePackage(id, request));
    }

    // Admin: Delete package
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }

    // Reduce available slots on payment confirmation
    @PutMapping("/{id}/reduce-slots")
    public ResponseEntity<PackageDTO> reduceSlots(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Integer count) {
        return ResponseEntity.ok(packageService.reduceAvailableSlots(id, count));
    }

    // Admin: Update status
    @PutMapping("/{id}/status")
    public ResponseEntity<PackageDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(packageService.updatePackageStatus(id, status));
    }
}

