// SystemSettingsController.java
package org.example.backend.controller;

import org.example.backend.dto.ConfigPropertyDTO;
import org.example.backend.dto.FeatureFlagDTO;
import org.example.backend.dto.SystemPropertyDTO;
import org.example.backend.service.DynamicConfigurationService;
import org.example.backend.service.FeatureFlagService;
import org.example.backend.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.metrics.MetricsEndpoint;
import org.springframework.boot.actuate.logging.LoggersEndpoint;
import org.springframework.boot.actuate.env.EnvironmentEndpoint;
import org.springframework.boot.logging.LogLevel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/system")
@PreAuthorize("hasRole('ADMIN')")
public class SystemSettingsController {

    private final SystemSettingsService systemSettingsService;
    private final DynamicConfigurationService dynamicConfigService;
    private final FeatureFlagService featureFlagService;
    private final MetricsEndpoint metricsEndpoint;
    private final LoggersEndpoint loggersEndpoint;
    private final EnvironmentEndpoint environmentEndpoint;

    @Autowired
    public SystemSettingsController(SystemSettingsService systemSettingsService,
                                    DynamicConfigurationService dynamicConfigService,
                                    FeatureFlagService featureFlagService,
                                    MetricsEndpoint metricsEndpoint,
                                    LoggersEndpoint loggersEndpoint,
                                    EnvironmentEndpoint environmentEndpoint) {
        this.systemSettingsService = systemSettingsService;
        this.dynamicConfigService = dynamicConfigService;
        this.featureFlagService = featureFlagService;
        this.metricsEndpoint = metricsEndpoint;
        this.loggersEndpoint = loggersEndpoint;
        this.environmentEndpoint = environmentEndpoint;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();

        // JVM Metrics
        metrics.put("jvm.memory.used", metricsEndpoint.metric("jvm.memory.used", null));
        metrics.put("jvm.memory.max", metricsEndpoint.metric("jvm.memory.max", null));
        metrics.put("jvm.threads.live", metricsEndpoint.metric("jvm.threads.live", null));
        metrics.put("system.cpu.usage", metricsEndpoint.metric("system.cpu.usage", null));

        // HTTP Metrics
        metrics.put("http.server.requests", metricsEndpoint.metric("http.server.requests", null));

        // Database Connection Metrics
        metrics.put("hikaricp.connections", metricsEndpoint.metric("hikaricp.connections", null));

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/loggers")
    public ResponseEntity<LoggersEndpoint.LoggersDescriptor> getLoggers() {
        return ResponseEntity.ok(loggersEndpoint.loggers());
    }

    @PostMapping("/loggers/{name}")
    public ResponseEntity<Void> setLoggerLevel(@PathVariable String name, @RequestBody Map<String, String> levelMap) {
        String level = levelMap.get("level");
        // Konvertiere den String in ein LogLevel-Objekt
        loggersEndpoint.configureLogLevel(name, LogLevel.valueOf(level));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/properties")
    public ResponseEntity<List<SystemPropertyDTO>> getSystemProperties() {
        return ResponseEntity.ok(systemSettingsService.getSystemProperties());
    }

    @PutMapping("/properties/{key}")
    public ResponseEntity<SystemPropertyDTO> updateSystemProperty(
            @PathVariable String key,
            @RequestBody SystemPropertyDTO property) {
        return ResponseEntity.ok(systemSettingsService.updateSystemProperty(key, property.getValue()));
    }

    @GetMapping("/environment")
    public ResponseEntity<EnvironmentEndpoint.EnvironmentDescriptor> getEnvironment() {
        return ResponseEntity.ok(environmentEndpoint.environment(null));
    }

    @GetMapping("/health-summary")
    public ResponseEntity<Map<String, Object>> getHealthSummary() {
        return ResponseEntity.ok(systemSettingsService.getHealthSummary());
    }
    
    // Neue Methoden für dynamische Konfiguration
    @GetMapping("/config")
    public ResponseEntity<List<ConfigPropertyDTO>> getDynamicConfigurations() {
        return ResponseEntity.ok(dynamicConfigService.getDynamicProperties());
    }

    @GetMapping("/config/{key}")
    public ResponseEntity<ConfigPropertyDTO> getDynamicConfiguration(@PathVariable String key) {
        ConfigPropertyDTO property = dynamicConfigService.getDynamicProperty(key);
        if (property == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(property);
    }

    @PutMapping("/config/{key}")
    public ResponseEntity<ConfigPropertyDTO> updateDynamicConfiguration(
            @PathVariable String key,
            @RequestBody ConfigPropertyDTO property) {
        return ResponseEntity.ok(dynamicConfigService.updateDynamicProperty(key, property.getValue()));
    }

    // Neue Methoden für Feature Flags
    @GetMapping("/features")
    public ResponseEntity<List<FeatureFlagDTO>> getFeatureFlags() {
        return ResponseEntity.ok(featureFlagService.getAllFeatureFlags());
    }

    @GetMapping("/features/{key}")
    public ResponseEntity<FeatureFlagDTO> getFeatureFlag(@PathVariable String key) {
        FeatureFlagDTO flag = featureFlagService.getFeatureFlag(key);
        if (flag == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(flag);
    }

    @PutMapping("/features/{key}")
    public ResponseEntity<FeatureFlagDTO> updateFeatureFlag(
            @PathVariable String key,
            @RequestBody FeatureFlagDTO flag) {
        return ResponseEntity.ok(featureFlagService.updateFeatureFlag(key, flag.isEnabled()));
    }

    // Erweiterte Methode für Umgebungsvariablen
    @GetMapping("/environment/variables")
    public ResponseEntity<Map<String, String>> getEnvironmentVariables() {
        Map<String, String> variables = systemSettingsService.getEnvironmentVariables();
        return ResponseEntity.ok(variables);
    }
}