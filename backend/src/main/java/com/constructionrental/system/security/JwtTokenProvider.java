package com.constructionrental.system.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret:${app.jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}}")
    private String jwtSecret;

    @Value("${jwt.expiration:${app.jwt.expiration-ms:86400000}}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            if (keyBytes.length >= 32) {
                return Keys.hmacShaKeyFor(keyBytes);
            }
        } catch (Exception ignored) {
            // Fallback to UTF-8 bytes below
        }
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        var builder = Jwts.builder()
                .subject(userPrincipal.getUsername())
                .claim("userId", userPrincipal.getId())
                .claim("email", userPrincipal.getUsername())
                .claim("name", userPrincipal.getName())
                .claim("role", userPrincipal.getRole())
                .claim("accountType", userPrincipal.getAccountType())
                .claim("isCustomer", userPrincipal.isCustomer())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey());

        if (userPrincipal.getCustomerType() != null) {
            builder.claim("customerType", userPrincipal.getCustomerType());
        }

        return builder.compact();
    }

    public String getUsernameFromJwt(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public Long getUserIdFromJwt(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        Object userIdObj = claims.get("userId");
        if (userIdObj instanceof Number number) {
            return number.longValue();
        }
        return null;
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            logger.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }
}
