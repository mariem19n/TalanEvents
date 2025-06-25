package com.example.stage_talan.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    private LocalDateTime expiration;

    private boolean used = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;


    public Long getId() { return id; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public LocalDateTime getExpiration() { return expiration; }
    public void setExpiration(LocalDateTime expiration) { this.expiration = expiration; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public boolean isUsed() { return used; }
    public void setUsed(boolean used) { this.used = used; }
}
