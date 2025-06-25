package com.example.stage_talan.service;

import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.model.PasswordResetToken;
import com.example.stage_talan.repository.AppUserRepository;
import com.example.stage_talan.repository.PasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;


    //Traitement de l'oubli de mot de passe
    @Transactional
    public void processForgotPassword(String email) {
        Optional<AppUser> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Adresse email non reconnue.");
        }

        AppUser user = userOptional.get();

        tokenRepository.deleteAllByUser(user);

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiration(LocalDateTime.now().plusHours(1));
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(email, token);
    }


    //Reinitialisation du mot de passe avec un token valide
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalide."));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Ce lien a déjà été utilisé.");
        }

        if (resetToken.getExpiration().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Ce lien a expiré.");
        }

        AppUser user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
