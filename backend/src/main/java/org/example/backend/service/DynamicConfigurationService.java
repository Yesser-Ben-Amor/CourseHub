package org.example.backend.service;

import org.example.backend.dto.ConfigPropertyDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;
import org.springframework.core.env.PropertySource;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DynamicConfigurationService {

    private static final String DYNAMIC_PROPERTY_SOURCE = "dynamicProperties";
    private final ConfigurableEnvironment environment;
    private final Map<String, ConfigPropertyDTO> dynamicProperties = new HashMap<>();

    @Autowired
    public DynamicConfigurationService(ConfigurableEnvironment environment) {
        this.environment = environment;
        initDynamicPropertySource();
        initDefaultDynamicProperties();
    }

    private void initDynamicPropertySource() {
        MutablePropertySources propertySources = environment.getPropertySources();
        if (!propertySources.contains(DYNAMIC_PROPERTY_SOURCE)) {
            propertySources.addFirst(new MapPropertySource(DYNAMIC_PROPERTY_SOURCE, new HashMap<>()));
        }
    }

    private void initDefaultDynamicProperties() {
        // Beispiel für dynamische Eigenschaften
        setDynamicProperty("app.feature.advanced-search", "true", "Aktiviert erweiterte Suchfunktionen", true);
        setDynamicProperty("app.feature.course-recommendations", "false", "Aktiviert Kursempfehlungen", true);
        setDynamicProperty("app.ui.theme", "dark", "UI-Theme (dark/light)", true);
        setDynamicProperty("app.cache.ttl", "3600", "Cache-Lebensdauer in Sekunden", true);
    }

    public List<ConfigPropertyDTO> getDynamicProperties() {
        return new ArrayList<>(dynamicProperties.values());
    }

    public ConfigPropertyDTO getDynamicProperty(String key) {
        return dynamicProperties.get(key);
    }

    public ConfigPropertyDTO setDynamicProperty(String key, String value, String description, boolean editable) {
        ConfigPropertyDTO property = new ConfigPropertyDTO(key, value, description, editable);
        dynamicProperties.put(key, property);
        updatePropertySource(key, value);
        return property;
    }

    public ConfigPropertyDTO updateDynamicProperty(String key, String value) {
        if (!dynamicProperties.containsKey(key)) {
            throw new IllegalArgumentException("Dynamische Eigenschaft nicht gefunden: " + key);
        }

        ConfigPropertyDTO property = dynamicProperties.get(key);
        if (!property.isEditable()) {
            throw new IllegalArgumentException("Eigenschaft nicht editierbar: " + key);
        }

        property.setValue(value);
        updatePropertySource(key, value);
        return property;
    }

    private void updatePropertySource(String key, String value) {
        MutablePropertySources propertySources = environment.getPropertySources();
        PropertySource<?> propertySource = propertySources.get(DYNAMIC_PROPERTY_SOURCE);

        if (propertySource instanceof MapPropertySource) {
            Map<String, Object> source = ((MapPropertySource) propertySource).getSource();
            source.put(key, value);
        }
    }
}