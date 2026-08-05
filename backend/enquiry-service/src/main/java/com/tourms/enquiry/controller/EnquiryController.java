package com.tourms.enquiry.controller;

import com.tourms.enquiry.dto.EnquiryReplyRequest;
import com.tourms.enquiry.dto.EnquiryRequest;
import com.tourms.enquiry.dto.EnquiryResponse;
import com.tourms.enquiry.security.JwtUtil;
import com.tourms.enquiry.service.EnquiryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enquiries")
public class EnquiryController {

    @Autowired
    private EnquiryService enquiryService;

    @Autowired
    private JwtUtil jwtUtil;

    // Customer: Submit enquiry
    @PostMapping
    public ResponseEntity<EnquiryResponse> createEnquiry(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody EnquiryRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(enquiryService.createEnquiry(userId, request));
    }

    // Customer: Get my enquiries
    @GetMapping("/my")
    public ResponseEntity<List<EnquiryResponse>> getMyEnquiries(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(enquiryService.getMyEnquiries(userId));
    }

    // Admin: Get all enquiries
    @GetMapping("/all")
    public ResponseEntity<List<EnquiryResponse>> getAllEnquiries() {
        return ResponseEntity.ok(enquiryService.getAllEnquiries());
    }

    // Admin: Reply to enquiry
    @PutMapping("/{id}/reply")
    public ResponseEntity<EnquiryResponse> replyToEnquiry(
            @PathVariable Long id,
            @Valid @RequestBody EnquiryReplyRequest request) {
        return ResponseEntity.ok(enquiryService.replyToEnquiry(id, request));
    }

    // Admin / Customer: Delete enquiry
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnquiry(@PathVariable Long id) {
        enquiryService.deleteEnquiry(id);
        return ResponseEntity.noContent().build();
    }

    // Get enquiry by ID
    @GetMapping("/{id}")
    public ResponseEntity<EnquiryResponse> getEnquiryById(@PathVariable Long id) {
        return ResponseEntity.ok(enquiryService.getEnquiryById(id));
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

