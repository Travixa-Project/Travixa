package com.tourms.enquiry.controller;

import com.tourms.enquiry.entity.Wishlist;
import com.tourms.enquiry.security.JwtUtil;
import com.tourms.enquiry.service.EnquiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private EnquiryService enquiryService;

    @Autowired
    private JwtUtil jwtUtil;

    // Customer: Get my wishlist items
    @GetMapping("/my")
    public ResponseEntity<List<Wishlist>> getMyWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(enquiryService.getMyWishlist(userId));
    }

    // Customer: Add package to wishlist
    @PostMapping("/{packageId}")
    public ResponseEntity<Wishlist> addToWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long packageId) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(enquiryService.addToWishlist(userId, packageId));
    }

    // Customer: Remove package from wishlist
    @DeleteMapping("/{packageId}")
    public ResponseEntity<Void> removeFromWishlist(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long packageId) {
        Long userId = extractUserId(authHeader);
        enquiryService.removeFromWishlist(userId, packageId);
        return ResponseEntity.noContent().build();
    }

    private Long extractUserId(String authHeader) {
        if (authHeader == null || authHeader.trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        String token = authHeader.replace("Bearer ", "").trim();
        return jwtUtil.extractUserId(token);
    }
}

