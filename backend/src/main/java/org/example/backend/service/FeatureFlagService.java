package org.example.backend.service;

import org.example.backend.dto.FeatureFlagDTO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FeatureFlagService {

    private final Map<String, FeatureFlagDTO> featureFlags = new HashMap<>();

    public FeatureFlagService() {
        initDefaultFeatureFlags();
    }

    private void initDefaultFeatureFlags() {
        // Beispiel-Feature-Flags
        addFeatureFlag("user-registration", true, "Ermöglicht die Registrierung neuer Benutzer");
        addFeatureFlag("social-login", true, "Ermöglicht die Anmeldung über soziale Netzwerke");
        addFeatureFlag("course-rating", true, "Ermöglicht das Bewerten von Kursen");
        addFeatureFlag("advanced-analytics", false, "Aktiviert erweiterte Analysen für Kurse");
        addFeatureFlag("live-chat", false, "Aktiviert Live-Chat-Funktionalität");
        addFeatureFlag("beta-features", false, "Aktiviert experimentelle Beta-Funktionen");
    }

    public List<FeatureFlagDTO> getAllFeatureFlags() {
        return new ArrayList<>(featureFlags.values());
    }

    public FeatureFlagDTO getFeatureFlag(String key) {
        return featureFlags.get(key);
    }

    public boolean isFeatureEnabled(String key) {
        FeatureFlagDTO flag = featureFlags.get(key);
        return flag != null && flag.isEnabled();
    }

    public FeatureFlagDTO addFeatureFlag(String key, boolean enabled, String description) {
        FeatureFlagDTO flag = new FeatureFlagDTO(key, enabled, description);
        featureFlags.put(key, flag);
        return flag;
    }

    public FeatureFlagDTO updateFeatureFlag(String key, boolean enabled) {
        FeatureFlagDTO flag = featureFlags.get(key);
        if (flag == null) {
            throw new IllegalArgumentException("Feature-Flag nicht gefunden: " + key);
        }
        flag.setEnabled(enabled);
        return flag;
    }
}