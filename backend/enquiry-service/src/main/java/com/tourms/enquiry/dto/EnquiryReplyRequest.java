package com.tourms.enquiry.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class EnquiryReplyRequest {

    @NotBlank(message = "Reply message is required")
    private String adminReply;
}

