package com.tourms.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RazorpayVerificationRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    private Long packageId;
    private Integer numberOfPersons;

    @NotNull(message = "Razorpay Order ID is required")
    private String razorpayOrderId;

    @NotNull(message = "Razorpay Payment ID is required")
    private String razorpayPaymentId;

    @NotNull(message = "Razorpay Signature is required")
    private String razorpaySignature;

    private String paymentMethod;
}

