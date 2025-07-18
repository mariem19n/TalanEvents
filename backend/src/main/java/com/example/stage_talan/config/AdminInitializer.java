package com.example.stage_talan.config;

import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.model.Role;
import com.example.stage_talan.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin@talent.tn";
        if (!userRepository.existsByEmail(adminEmail)) {
            AppUser admin = new AppUser();
            admin.setFirstName("Admin");
            admin.setLastName("Talan");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin2025"));
            admin.setRoles(Set.of(Role.ADMIN));
            userRepository.save(admin);
            System.out.println("Compte admin créé");
        }
    }
}
