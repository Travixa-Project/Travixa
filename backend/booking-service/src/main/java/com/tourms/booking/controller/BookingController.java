package com.tourms.booking.controller;

import com.tourms.booking.dto.BookingRequest;
import com.tourms.booking.dto.BookingResponse;
import com.tourms.booking.security.JwtUtil;
import com.tourms.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private JwtUtil jwtUtil;

    // Customer: Create booking
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody BookingRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.createBooking(userId, request));
    }

    // Customer: Get my bookings
    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    // Customer: Cancel my booking
    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelMyBooking(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable Long id) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(bookingService.cancelMyBooking(userId, id));
    }

    // Admin: Get all bookings
    @GetMapping("/all")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    // Admin: Confirm booking
    @PutMapping("/{id}/confirm")
    public ResponseEntity<BookingResponse> confirmBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.confirmBooking(id));
    }

    // Admin: Mark booking as COMPLETED
    @PutMapping("/{id}/complete")
    public ResponseEntity<BookingResponse> completeBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.completeBooking(id));
    }

    // Admin: Cancel booking
    @PutMapping("/{id}/admin-cancel")
    public ResponseEntity<BookingResponse> adminCancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.adminCancelBooking(id));
    }

    // Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    // Internal: Verify if user has confirmed booking for a package (called by Review Service)
    @GetMapping("/verify")
    public ResponseEntity<Boolean> hasConfirmedBooking(
            @RequestParam Long userId,
            @RequestParam Long packageId,
            @RequestParam(required = false) Long bookingId) {
        return ResponseEntity.ok(bookingService.hasConfirmedBooking(userId, packageId, bookingId));
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

