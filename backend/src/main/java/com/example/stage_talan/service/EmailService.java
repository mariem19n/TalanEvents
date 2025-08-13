package com.example.stage_talan.service;

import com.example.stage_talan.repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetLink = "http://localhost:4200/auth/reset-password/" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Réinitialisation de mot de passe");
        message.setText("Cliquez sur ce lien pour réinitialiser votre mot de passe : " + resetLink);
        message.setFrom("eventtalan@gmail.com");

        mailSender.send(message);

        System.out.println("📤 Email envoyé à : " + toEmail);
        System.out.println("🔗 Lien : http://localhost:4200/reset-password/" + token);

    }

    // Méthode appelée automatiquement chaque heure pour nettoyer les tokens expirés
    @Transactional
    @Scheduled(cron = "0 0 * * * *")
    public void cleanupExpiredTokens() {
        System.out.println(" Nettoyage des tokens expirés lancé à " + LocalDateTime.now());
        tokenRepository.deleteAllByExpirationBefore(LocalDateTime.now());
    }
}
