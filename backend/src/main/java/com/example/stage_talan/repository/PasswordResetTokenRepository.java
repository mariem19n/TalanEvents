package com.example.stage_talan.repository;

import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    void deleteAllByUser(AppUser user); // pour supprimer les anciens tokens d’un user
    void deleteAllByExpirationBefore(LocalDateTime now); // pour suppression automatique
}
