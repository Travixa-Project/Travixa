package com.tourms.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponse {

    private String orderId;
    private String keyId;
    private Long amountInPaise;
    private BigDecimal amount;
    private String currency;
    private Long bookingId;
}

