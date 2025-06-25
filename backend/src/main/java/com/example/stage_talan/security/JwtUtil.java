package com.example.stage_talan.security;

import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Génère un token à partir de l'email (username)
    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    // Extrait l'email (username) à partir du token
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // Vérifie la validité du token (signature + expiration)
    public boolean validateToken(String token) {
        try {
            getClaims(token); // S'il y a une erreur ici, le token est invalide
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // Parse et retourne les claims du token
    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }
}
