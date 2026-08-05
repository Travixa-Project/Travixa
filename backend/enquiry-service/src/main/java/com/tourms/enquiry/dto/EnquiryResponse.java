package com.tourms.enquiry.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnquiryResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long packageId;
    private String packageTitle;
    private String subject;
    private String message;
    private String adminReply;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

