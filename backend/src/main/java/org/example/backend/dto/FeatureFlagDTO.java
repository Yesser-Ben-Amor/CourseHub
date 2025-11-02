package org.example.backend.dto;

public class FeatureFlagDTO {
    private String key;
    private boolean enabled;
    private String description;
    
    public FeatureFlagDTO() {
    }
    
    public FeatureFlagDTO(String key, boolean enabled, String description) {
        this.key = key;
        this.enabled = enabled;
        this.description = description;
    }
    
    public String getKey() {
        return key;
    }
    
    public void setKey(String key) {
        this.key = key;
    }
    
    public boolean isEnabled() {
        return enabled;
    }
    
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}