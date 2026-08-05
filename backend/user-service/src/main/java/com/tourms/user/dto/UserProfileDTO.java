package com.tourms.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {

    private Long id;

    private Long authUserId;

    private String fullName;

    private String email;

    private String phone;

    private String address;

    private String city;

    private String state;

    private String country;

    private String profileImageUrl;
}
