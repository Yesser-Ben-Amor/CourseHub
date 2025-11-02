// SystemPropertyDTO.java
package org.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemPropertyDTO {
    private String key;
    private String value;
    private String description;
    private boolean editable;
}