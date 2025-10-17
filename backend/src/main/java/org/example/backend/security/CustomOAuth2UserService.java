package org.example.backend.security;

import org.example.backend.entity.UserEntity;
import org.example.backend.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        String providerId = oAuth2User.getAttribute("id") != null
                ? oAuth2User.getAttribute("id").toString()
                : oAuth2User.getAttribute("sub");

        String emailAttr = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String login = oAuth2User.getAttribute("login"); // GitHub username
        
        // Email Fallback: Wenn keine Email, verwende login@github.com
        final String email = (emailAttr == null || emailAttr.isEmpty()) 
            ? (login != null ? login : "user" + providerId) + "@" + provider + ".com"
            : emailAttr;
        
        // Username generieren falls nicht vorhanden
        final String username = login != null ? login 
            : (name != null ? name.replaceAll("\\s+", "_").toLowerCase() 
            : email.split("@")[0]);

        // User suchen oder erstellen
        UserEntity user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> {
                    UserEntity newUser = new UserEntity();
                    newUser.setProvider(provider);
                    newUser.setProviderId(providerId);
                    newUser.setEmail(email);
                    newUser.setUsername(generateUniqueUsername(username));
                    newUser.setPasswordHash(null); // OAuth2 Users brauchen kein Passwort
                    return userRepository.save(newUser);
                });

        return oAuth2User;
    }

    private String generateUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;

        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }
}