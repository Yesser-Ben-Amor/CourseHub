package org.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/chat")
public class ChatMessageController {

    // Seminar ID -> List of messages
    private final Map<String, CopyOnWriteArrayList<ChatMessage>> chatMessages = new ConcurrentHashMap<>();

    // Maximale Anzahl von Nachrichten pro Seminar
    private static final int MAX_MESSAGES = 100;

    @GetMapping("/{seminarId}")
    public ResponseEntity<List<ChatMessage>> getMessages(
            @PathVariable String seminarId,
            @RequestParam(required = false) Long after) {

        List<ChatMessage> messages = chatMessages.getOrDefault(seminarId, new CopyOnWriteArrayList<>());

        if (after != null) {
            // Nur Nachrichten nach dem angegebenen Zeitstempel zurückgeben
            List<ChatMessage> newMessages = new ArrayList<>();
            for (ChatMessage message : messages) {
                if (message.getTimestamp().isAfter(LocalDateTime.now().minusSeconds(after))) {
                    newMessages.add(message);
                }
            }
            return ResponseEntity.ok(newMessages);
        }

        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{seminarId}")
    public ResponseEntity<ChatMessage> addMessage(
            @PathVariable String seminarId,
            @RequestBody ChatMessage message) {

        message.setSeminarId(seminarId);
        message.setTimestamp(LocalDateTime.now());

        CopyOnWriteArrayList<ChatMessage> messages = chatMessages.computeIfAbsent(
                seminarId, k -> new CopyOnWriteArrayList<>());

        // Begrenze die Anzahl der Nachrichten
        while (messages.size() >= MAX_MESSAGES) {
            messages.remove(0);
        }

        messages.add(message);

        return ResponseEntity.ok(message);
    }

    public static class ChatMessage {
        private String id = UUID.randomUUID().toString();
        private String content;
        private String sender;
        private String seminarId;
        private LocalDateTime timestamp;
        private MessageType type;

        public enum MessageType {
            CHAT, JOIN, LEAVE
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
}