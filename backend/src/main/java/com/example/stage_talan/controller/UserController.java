package com.example.stage_talan.controller;

import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.repository.AppUserRepository;
import com.example.stage_talan.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private AppUserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {

        // Récupère l’email à partir du SecurityContext
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Ne pas renvoyer le mot de passe
        user.setPassword(null);

        return ResponseEntity.ok(user);
    }
}
