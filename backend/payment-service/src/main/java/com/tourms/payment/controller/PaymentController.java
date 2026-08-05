package com.tourms.payment.controller;

import com.tourms.payment.dto.*;
import com.tourms.payment.security.JwtUtil;
import com.tourms.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private JwtUtil jwtUtil;

    // Customer: Create Razorpay Order
    @PostMapping("/create-order")
    public ResponseEntity<RazorpayOrderResponse> createRazorpayOrder(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam Long bookingId,
            @RequestParam BigDecimal amount) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(paymentService.createRazorpayOrder(userId, bookingId, amount));
    }

    // Customer: Verify Razorpay Payment Signature
    @PostMapping("/verify")
    public ResponseEntity<PaymentResponse> verifyRazorpayPayment(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody RazorpayVerificationRequest request) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(paymentService.verifyRazorpayPayment(userId, request));
    }

    // Customer: Get my payments
    @GetMapping("/my")
    public ResponseEntity<List<PaymentResponse>> getMyPayments(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        return ResponseEntity.ok(paymentService.getMyPayments(userId));
    }

    // Get payments by booking ID
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentsByBooking(bookingId));
    }

    // Get all payments (Admin only)
    @GetMapping("/all")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // Get single payment record by ID
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
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

