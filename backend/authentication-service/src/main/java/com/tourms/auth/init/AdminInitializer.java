package com.tourms.auth.init;

import com.tourms.auth.entity.User;
import com.tourms.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initializes the default administrator account on application startup.
 * Runs only once — if the admin already exists, it does nothing.
 */
@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "patilvishu2122@gmail.com";

        // Check if admin already exists
        if (userRepository.existsByEmail(adminEmail)) {
            System.out.println("Admin account already exists. Skipping initialization.");
            return;
        }

        // Create the default administrator
        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode("Vishu@5697"));
        admin.setRole(User.Role.ADMIN);
        admin.setStatus(User.Status.ACTIVE);

        userRepository.save(admin);

        System.out.println("===========================================");
        System.out.println("Default admin account created successfully!");
        System.out.println("Email: " + adminEmail);
        System.out.println("Role: ADMIN");
        System.out.println("===========================================");
    }
}
