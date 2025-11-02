// SystemSettingsController.java
/*
package org.example.backend.controller;

import org.example.backend.dto.SystemPropertyDTO;
import org.example.backend.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.metrics.MetricsEndpoint;
import org.springframework.boot.actuate.logging.LoggersEndpoint;
import org.springframework.boot.actuate.env.EnvironmentEndpoint;
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
    private final MetricsEndpoint metricsEndpoint;
    private final LoggersEndpoint loggersEndpoint;
    private final EnvironmentEndpoint environmentEndpoint;

    @Autowired
    public SystemSettingsController(SystemSettingsService systemSettingsService,
                                    MetricsEndpoint metricsEndpoint,
                                    LoggersEndpoint loggersEndpoint,
                                    EnvironmentEndpoint environmentEndpoint) {
        this.systemSettingsService = systemSettingsService;
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
        loggersEndpoint.configureLogLevel(name, LoggersEndpoint.LogLevel.valueOf(level));
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
}*/