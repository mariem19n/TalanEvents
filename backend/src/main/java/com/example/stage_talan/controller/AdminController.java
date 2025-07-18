package com.example.stage_talan.controller;

import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.model.Role;
import com.example.stage_talan.repository.AppUserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AppUserRepository userRepository;

    public AdminController(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/test")
    public String testAdmin() {
        return "Accès admin autorisé !";
    }

    @PutMapping("/promote/{userId}")
    public String promoteToOrganizer(@PathVariable Long userId) {
        AppUser user = userRepository.findById(userId).orElseThrow();
        user.getRoles().add(Role.ORGANIZER);
        userRepository.save(user);
        return "L'utilisateur a été promu à ORGANIZER.";
    }
}
