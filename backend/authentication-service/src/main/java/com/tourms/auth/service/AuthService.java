package com.tourms.auth.service;

import com.tourms.auth.dto.AuthResponse;
import com.tourms.auth.dto.LoginRequest;
import com.tourms.auth.dto.RegisterRequest;
import com.tourms.auth.entity.User;
import com.tourms.auth.repository.UserRepository;
import com.tourms.auth.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${user.service.url}")
    private String userServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Register a new CUSTOMER
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        // Create user with CUSTOMER role
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.CUSTOMER);
        user.setStatus(User.Status.ACTIVE);

        User savedUser = userRepository.save(user);

        // Create user profile in User Service
        try {
            Map<String, Object> profileRequest = new HashMap<>();
            profileRequest.put("authUserId", savedUser.getId());
            profileRequest.put("fullName", request.getFullName());
            profileRequest.put("email", request.getEmail());
            profileRequest.put("phone", request.getPhone());

            restTemplate.postForObject(
                    userServiceUrl + "/api/users/profile/create",
                    profileRequest,
                    Object.class
            );
        } catch (Exception e) {
            System.out.println("Warning: Could not create user profile - " + e.getMessage());
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(token, savedUser.getEmail(), savedUser.getRole().name(),
                savedUser.getId(), "Registration successful");
    }


    // Login
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (user.getStatus() == User.Status.INACTIVE) {
            throw new RuntimeException("Your account has been deactivated. Please contact admin.");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return new AuthResponse(token, user.getEmail(), user.getRole().name(),
                user.getId(), "Login successful");
    }

    // Validate token (used by other services)
    public Map<String, Object> validateToken(String token) {
        if (!jwtUtil.validateToken(token)) {
            throw new RuntimeException("Invalid or expired token");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", jwtUtil.extractUserId(token));
        claims.put("email", jwtUtil.extractEmail(token));
        claims.put("role", jwtUtil.extractRole(token));
        claims.put("valid", true);

        return claims;
    }
}
