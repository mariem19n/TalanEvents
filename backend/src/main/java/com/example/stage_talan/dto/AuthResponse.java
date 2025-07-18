package com.example.stage_talan.dto;

import com.example.stage_talan.model.Role;
import lombok.Data;

import java.util.Set;

@Data
public class AuthResponse {
    private String accessToken;
    private Set<Role> roles;
}
