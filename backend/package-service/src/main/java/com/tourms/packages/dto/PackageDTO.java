package com.tourms.packages.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageDTO {

    private Long id;
    private String title;
    private String description;
    private String category;
    private String destinationsCovered;
    private Integer durationDays;
    private Integer durationNights;
    private BigDecimal price;
    private Integer maxPersons;
    private Integer availableSlots;
    private LocalDate startDate;
    private LocalDate endDate;
    private String imageUrl;
    private String highlights;
    private String inclusions;
    private String exclusions;
    private String status;
    private Boolean featured;
}

