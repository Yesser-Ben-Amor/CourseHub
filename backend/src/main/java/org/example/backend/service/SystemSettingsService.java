// SystemSettingsService.java
package org.example.backend.service;

import org.example.backend.dto.SystemPropertyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SystemSettingsService {

    private final Environment environment;
    private final HealthEndpoint healthEndpoint;
    private final Map<String, SystemPropertyDTO> editableProperties = new HashMap<>();

    @Autowired
    public SystemSettingsService(Environment environment, HealthEndpoint healthEndpoint) {
        this.environment = environment;
        this.healthEndpoint = healthEndpoint;
        initEditableProperties();
    }

    private void initEditableProperties() {
        // Diese Eigenschaften können zur Laufzeit geändert werden
        editableProperties.put("app.upload.max-file-size",
                new SystemPropertyDTO("app.upload.max-file-size", "15MB",
                        "Maximale Dateigröße für Uploads", true));

        editableProperties.put("app.session.timeout",
                new SystemPropertyDTO("app.session.timeout", "30m",
                        "Session-Timeout in Minuten", true));

        editableProperties.put("app.notification.enabled",
                new SystemPropertyDTO("app.notification.enabled", "true",
                        "E-Mail-Benachrichtigungen aktivieren", true));
    }

    public List<SystemPropertyDTO> getSystemProperties() {
        List<SystemPropertyDTO> properties = new ArrayList<>(editableProperties.values());

        // Füge einige Systemeigenschaften hinzu (nicht editierbar)
        properties.add(new SystemPropertyDTO("java.version",
                System.getProperty("java.version"), "Java Version", false));

        properties.add(new SystemPropertyDTO("os.name",
                System.getProperty("os.name"), "Betriebssystem", false));

        properties.add(new SystemPropertyDTO("user.timezone",
                System.getProperty("user.timezone"), "Zeitzone", false));

        return properties;
    }

    public SystemPropertyDTO updateSystemProperty(String key, String value) {
        if (!editableProperties.containsKey(key)) {
            throw new IllegalArgumentException("Property nicht editierbar: " + key);
        }

        SystemPropertyDTO property = editableProperties.get(key);
        property.setValue(value);

        // Hier könnte man die Änderung in einer Datenbank speichern
        // oder eine Konfigurationsdatei aktualisieren

        return property;
    }

    public Map<String, Object> getHealthSummary() {
        Map<String, Object> health = new HashMap<>();

        // Basis-Gesundheitsstatus
        health.put("status", healthEndpoint.health().getStatus().toString());

        // Datenbank-Status
        try {
            Status dbStatus = (Status) healthEndpoint.healthForPath("db").getStatus();
            health.put("database", dbStatus.toString());
        } catch (Exception e) {
            health.put("database", "UNKNOWN");
        }

        // Disk-Space
        try {
            Status diskStatus = (Status) healthEndpoint.healthForPath("diskSpace").getStatus();
            health.put("diskSpace", diskStatus.toString());
        } catch (Exception e) {
            health.put("diskSpace", "UNKNOWN");
        }

        return health;
    }
    
    public Map<String, String> getEnvironmentVariables() {
        Map<String, String> variables = new HashMap<>();
        
        // Sichere Umgebungsvariablen (keine Passwörter oder Secrets)
        Map<String, String> env = System.getenv();
        for (String key : env.keySet()) {
            // Filtern Sie sensible Informationen
            if (!key.toLowerCase().contains("password") && 
                !key.toLowerCase().contains("secret") && 
                !key.toLowerCase().contains("key")) {
                variables.put(key, env.get(key));
            }
        }
        
        // Fügen Sie einige JVM-Eigenschaften hinzu
        variables.put("java.version", System.getProperty("java.version"));
        variables.put("java.home", System.getProperty("java.home"));
        variables.put("user.dir", System.getProperty("user.dir"));
        
        return variables;
    }
}