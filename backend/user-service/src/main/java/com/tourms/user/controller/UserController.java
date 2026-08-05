package com.tourms.user.controller;

import com.tourms.user.dto.CreateProfileRequest;
import com.tourms.user.dto.UpdateProfileRequest;
import com.tourms.user.dto.UserProfileDTO;
import com.tourms.user.security.JwtUtil;
import com.tourms.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    // Internal: Create profile (called by Auth Service)
    @PostMapping("/profile/create")
    public ResponseEntity<UserProfileDTO> createProfile(@RequestBody CreateProfileRequest request) {
        UserProfileDTO profile = userService.createProfile(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(profile);
    }

    // Get own profile (Customer)
    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getMyProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        Long userId = extractUserId(authHeader);
        UserProfileDTO profile = userService.getProfileByAuthUserId(userId);
        return ResponseEntity.ok(profile);
    }

    // Update own profile (Customer)
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDTO> updateMyProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody UpdateProfileRequest request) {
        Long userId = extractUserId(authHeader);
        UserProfileDTO profile = userService.updateProfile(userId, request);
        return ResponseEntity.ok(profile);
    }

    // Get all customers (Admin only)
    @GetMapping("/all")
    public ResponseEntity<List<UserProfileDTO>> getAllProfiles() {
        List<UserProfileDTO> profiles = userService.getAllProfiles();
        return ResponseEntity.ok(profiles);
    }

    // Get specific customer profile by profile ID or authUserId
    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getProfileById(@PathVariable Long id) {
        UserProfileDTO profile;
        try {
            profile = userService.getProfileById(id);
        } catch (Exception e) {
            profile = userService.getProfileByAuthUserId(id);
        }
        return ResponseEntity.ok(profile);
    }

    private Long extractUserId(String authHeader) {
        if (authHeader == null || authHeader.trim().isEmpty()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }
        String token = authHeader.replace("Bearer ", "").trim();
        return jwtUtil.extractUserId(token);
    }
}

