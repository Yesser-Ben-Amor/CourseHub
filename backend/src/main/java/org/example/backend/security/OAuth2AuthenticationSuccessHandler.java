package org.example.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.example.backend.entity.UserEntity;
import org.example.backend.repository.UserRepository;
import org.example.backend.util.JwtUtil;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public OAuth2AuthenticationSuccessHandler(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Provider und ProviderId aus dem Request holen
        String provider = ((org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken) authentication)
            .getAuthorizedClientRegistrationId();
        String providerId = oAuth2User.getAttribute("id") != null 
            ? oAuth2User.getAttribute("id").toString() 
            : oAuth2User.getAttribute("sub");

        // User per provider + providerId suchen
        UserEntity user = userRepository.findByProviderAndProviderId(provider, providerId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // JWT Token generieren
        String token = jwtUtil.generateToken(user.getUsername());

        // Redirect zum Frontend mit Token
        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/campus")
                .queryParam("token", token)
                .queryParam("username", user.getUsername())
                .queryParam("email", user.getEmail())
                .queryParam("id", user.getId())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}