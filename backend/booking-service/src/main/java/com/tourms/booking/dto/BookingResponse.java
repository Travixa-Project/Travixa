package com.tourms.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private Long id;
    private Long userId;
    private Long packageId;
    private String packageTitle;
    private LocalDate bookingDate;
    private LocalDate travelDate;
    private Integer numberOfPersons;
    private BigDecimal totalAmount;
    private String status;
    private String specialRequests;
}

