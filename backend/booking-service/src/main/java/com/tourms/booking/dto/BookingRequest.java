package com.tourms.booking.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookingRequest {

    @NotNull(message = "Package ID is required")
    private Long packageId;

    @NotBlank(message = "Package title is required")
    private String packageTitle;

    private LocalDate travelDate;

    @NotNull(message = "Number of persons is required")
    @Min(value = 1, message = "At least 1 person required")
    private Integer numberOfPersons;

    @NotNull(message = "Total amount is required")
    private BigDecimal totalAmount;

    private String specialRequests;
}

