package com.example.stage_talan.controller;

import com.example.stage_talan.dto.UserDto;
import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.repository.AppUserRepository;
import com.example.stage_talan.security.JwtUtil;
import com.example.stage_talan.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getUserIdByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email)
                .map(user -> ResponseEntity.ok(new UserIdDTO(user.getId())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }


    // DTO interne pour ne renvoyer que l’ID
    public static class UserIdDTO {
        private Long id;

        public UserIdDTO(Long id) {
            this.id = id;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }
    }

}
