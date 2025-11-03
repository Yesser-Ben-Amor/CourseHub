package org.example.backend.dto;

import java.time.LocalDateTime;

public class ChatMessageDTO {
    private String id;
    private String content;
    private String sender;
    private String seminarId;
    private LocalDateTime timestamp;
    private MessageType type;

    public enum MessageType {
        CHAT, JOIN, LEAVE
    }

    // Standard-Konstruktor
    public ChatMessageDTO() {
    }

    // Konstruktor mit Parametern
    public ChatMessageDTO(String content, String sender, String seminarId, MessageType type) {
        this.content = content;
        this.sender = sender;
        this.seminarId = seminarId;
        this.timestamp = LocalDateTime.now();
        this.type = type;
    }

    // Getter und Setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getSeminarId() {
        return seminarId;
    }

    public void setSeminarId(String seminarId) {
        this.seminarId = seminarId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }
}