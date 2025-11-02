// SystemPropertyDTO.java
package org.example.backend.dto;

public class SystemPropertyDTO {
    private String key;
    private String value;
    private String description;
    private boolean editable;
    
    public SystemPropertyDTO() {
    }
    
    public SystemPropertyDTO(String key, String value, String description, boolean editable) {
        this.key = key;
        this.value = value;
        this.description = description;
        this.editable = editable;
    }
    
    public String getKey() {
        return key;
    }
    
    public void setKey(String key) {
        this.key = key;
    }
    
    public String getValue() {
        return value;
    }
    
    public void setValue(String value) {
        this.value = value;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public boolean isEditable() {
        return editable;
    }
    
    public void setEditable(boolean editable) {
        this.editable = editable;
    }
}