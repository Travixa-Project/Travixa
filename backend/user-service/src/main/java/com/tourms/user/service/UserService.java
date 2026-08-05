package com.tourms.user.service;

import com.tourms.user.dto.CreateProfileRequest;
import com.tourms.user.dto.UpdateProfileRequest;
import com.tourms.user.dto.UserProfileDTO;
import com.tourms.user.entity.UserProfile;
import com.tourms.user.repository.UserProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserProfileRepository profileRepository;

    // Create profile (called by Auth Service during registration)
    public UserProfileDTO createProfile(CreateProfileRequest request) {
        if (profileRepository.existsByAuthUserId(request.getAuthUserId())) {
            throw new RuntimeException("Profile already exists for this user");
        }

        UserProfile profile = new UserProfile();
        profile.setAuthUserId(request.getAuthUserId());
        profile.setFullName(request.getFullName());
        profile.setEmail(request.getEmail());
        profile.setPhone(request.getPhone());

        UserProfile saved = profileRepository.save(profile);
        return mapToDTO(saved);
    }

    // Get profile by auth user ID
    public UserProfileDTO getProfileByAuthUserId(Long authUserId) {
        UserProfile profile = profileRepository.findByAuthUserId(authUserId)
                .orElseGet(() -> createDefaultProfile(authUserId));
        return mapToDTO(profile);
    }

    // Update profile
    public UserProfileDTO updateProfile(Long authUserId, UpdateProfileRequest request) {
        UserProfile profile = profileRepository.findByAuthUserId(authUserId)
                .orElseGet(() -> createDefaultProfile(authUserId));

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getState() != null) profile.setState(request.getState());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());

        UserProfile saved = profileRepository.save(profile);
        return mapToDTO(saved);
    }

    private UserProfile createDefaultProfile(Long authUserId) {
        UserProfile newProfile = new UserProfile();
        newProfile.setAuthUserId(authUserId);
        if (authUserId != null && authUserId == 1L) {
            newProfile.setFullName("Vishvesh Patil");
            newProfile.setEmail("patilvishu2122@gmail.com");
            newProfile.setPhone("7387912826");
        } else {
            newProfile.setFullName("User #" + authUserId);
            newProfile.setEmail("user" + authUserId + "@system.local");
            newProfile.setPhone("0000000000");
        }
        return profileRepository.save(newProfile);
    }

    // Get all customers (Admin only)
    public List<UserProfileDTO> getAllProfiles() {
        return profileRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Get profile by ID
    public UserProfileDTO getProfileById(Long id) {
        UserProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return mapToDTO(profile);
    }

    private UserProfileDTO mapToDTO(UserProfile profile) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(profile.getId());
        dto.setAuthUserId(profile.getAuthUserId());
        dto.setFullName(profile.getFullName());
        dto.setEmail(profile.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setAddress(profile.getAddress());
        dto.setCity(profile.getCity());
        dto.setState(profile.getState());
        dto.setCountry(profile.getCountry());
        dto.setProfileImageUrl(profile.getProfileImageUrl());
        return dto;
    }
}
