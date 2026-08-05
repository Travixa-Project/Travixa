package com.tourms.user.dto;

import lombok.Data;

@Data
public class CreateProfileRequest {

    private Long authUserId;
    private String fullName;
    private String email;
    private String phone;
}

