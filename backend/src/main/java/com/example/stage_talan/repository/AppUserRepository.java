package com.example.stage_talan.repository;

import com.example.stage_talan.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    // Trouver un utilisateur par son email
    Optional<AppUser> findByEmail(String email);

    // Vérifier si un email existe déjà
    boolean existsByEmail(String email);
}
