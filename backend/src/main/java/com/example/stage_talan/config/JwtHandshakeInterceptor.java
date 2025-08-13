package com.example.stage_talan.config;

import com.example.stage_talan.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            String token = httpRequest.getParameter("token");
            System.out.println("🔑 WS TOKEN reçu : " + token);

            if (token != null && jwtUtil.validateToken(token)) {
                String userEmail = jwtUtil.extractUsername(token);

                // On met un Principal personnalisé dans la session WebSocket
                attributes.put("principal", (Principal) () -> userEmail);
                System.out.println("✅ WebSocket Principal : " + userEmail);
            } else {
                System.out.println("⛔ Token WebSocket manquant ou invalide");
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
        // rien à faire ici pour l'instant
    }
}


