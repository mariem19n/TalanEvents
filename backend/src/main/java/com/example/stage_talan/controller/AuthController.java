package com.example.stage_talan.controller;

import com.example.stage_talan.dto.AuthRequest;
import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.model.Role;
import com.example.stage_talan.repository.AppUserRepository;
import com.example.stage_talan.security.JwtUtil;
import com.example.stage_talan.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import com.example.stage_talan.model.PasswordResetToken;
import com.example.stage_talan.repository.PasswordResetTokenRepository;
import com.example.stage_talan.service.EmailService;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import com.example.stage_talan.dto.AuthResponse;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    @Autowired
    private PasswordResetService passwordResetService;


    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AppUser user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email déjà utilisé !"));
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Set.of(Role.USER));

        AppUser savedUser = userRepository.save(user);
        return ResponseEntity.ok("Utilisateur enregistré avec succès : " + savedUser.getEmail());
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {

        //System.out.println("Tentative de login : " + request.getEmail());

        // Recherche de l'utilisateur
        AppUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérification du mot de passe haché
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("Email ou mot de passe incorrect.");
        }

        // Génération du token JWT
        String token = jwtUtil.generateToken(user);

        AuthResponse response = new AuthResponse();
        response.setAccessToken(token);
        response.setRoles(user.getRoles());

        return ResponseEntity.ok(response);
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            passwordResetService.processForgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "Lien de réinitialisation envoyé à " + email));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Erreur serveur : " + e.getMessage()));
        }
    }


    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            passwordResetService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Erreur serveur : " + e.getMessage()));
        }
    }



}
