package com.tourms.packages.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PackageRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    private String description;
    private String category;
    private String destinationsCovered;

    @NotNull(message = "Duration days is required")
    @Min(1)
    private Integer durationDays;

    @NotNull(message = "Duration nights is required")
    @Min(0)
    private Integer durationNights;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @Min(1)
    private Integer maxPersons = 50;

    @Min(0)
    private Integer availableSlots = 50;

    private LocalDate startDate;
    private LocalDate endDate;
    private String imageUrl;
    private String highlights;
    private String inclusions;
    private String exclusions;
    private Boolean featured = false;
}

