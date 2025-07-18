package com.example.stage_talan.security;

import com.example.stage_talan.model.AppUser;
import com.example.stage_talan.model.Role;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Génère un token avec email + rôles
    public String generateToken(AppUser user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", user.getRoles().stream().map(Enum::name).collect(Collectors.toList()));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    // Extrait l'email (subject) du token
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // Extrait les rôles du token
    public List<String> extractRoles(String token) {
        Object rolesObject = getClaims(token).get("roles");

        if (rolesObject instanceof List<?>) {
            return ((List<?>) rolesObject).stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }
        return List.of();
    }

    // Vérifie la validité du token
    public boolean validateToken(String token) {
        try {
            getClaims(token); // Vérifie signature et expiration
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Récupère les claims internes
    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }
}
