// /Users/Cutvert/IdeaProjects/CourseHub/backend/src/main/java/org/example/backend/websocket/SeminarChatHandler.java

package org.example.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class SeminarChatHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Seminar ID -> List of messages (begrenzte Historie)
    private final Map<String, CopyOnWriteArrayList<ChatMessage>> chatHistory = new ConcurrentHashMap<>();

    // Seminar ID -> Set of WebSocket Sessions
    private final Map<String, Set<WebSocketSession>> chatSessions = new ConcurrentHashMap<>();

    // Maximale Anzahl von Nachrichten pro Seminar im Speicher
    private static final int MAX_HISTORY_SIZE = 100;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String seminarId = extractSeminarId(session);
        if (seminarId != null) {
            // Session zum Seminar hinzufügen
            chatSessions.computeIfAbsent(seminarId, k ->
                    Collections.synchronizedSet(new HashSet<>())).add(session);

            // Chat-Historie für dieses Seminar senden
            sendChatHistory(session, seminarId);

            System.out.println("Chat WebSocket connected for seminar: " + seminarId +
                    ", Session: " + session.getId());
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String payload = message.getPayload().toString();
        ChatMessage chatMessage = objectMapper.readValue(payload, ChatMessage.class);

        String seminarId = extractSeminarId(session);
        if (seminarId == null || !seminarId.equals(chatMessage.getSeminarId())) {
            return; // Ignoriere Nachrichten für andere Seminare
        }

        // Nachricht mit Zeitstempel versehen
        if (chatMessage.getTimestamp() == null) {
            chatMessage.setTimestamp(LocalDateTime.now());
        }

        // Nachricht zur Historie hinzufügen
        CopyOnWriteArrayList<ChatMessage> history = chatHistory.computeIfAbsent(
                seminarId, k -> new CopyOnWriteArrayList<>());

        // Begrenze die Historie
        while (history.size() >= MAX_HISTORY_SIZE) {
            history.remove(0);
        }

        history.add(chatMessage);

        // Nachricht an alle Teilnehmer des Seminars senden
        broadcastMessage(chatMessage, seminarId);
    }

    private void sendChatHistory(WebSocketSession session, String seminarId) throws IOException {
        List<ChatMessage> history = chatHistory.getOrDefault(seminarId, new CopyOnWriteArrayList<>());

        if (!history.isEmpty()) {
            for (ChatMessage message : history) {
                String messageJson = objectMapper.writeValueAsString(message);
                session.sendMessage(new TextMessage(messageJson));
            }
        }
    }

    private void broadcastMessage(ChatMessage message, String seminarId) throws IOException {
        Set<WebSocketSession> sessions = chatSessions.get(seminarId);
        if (sessions != null) {
            String messageJson = objectMapper.writeValueAsString(message);
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(messageJson));
                }
            }
        }
    }

    private String extractSeminarId(WebSocketSession session) {
        String path = session.getUri().getPath();
        String[] parts = path.split("/");
        // Format: /ws/seminar-chat/{seminarId}
        return parts.length > 3 ? parts[3] : null;
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("Chat WebSocket transport error: " + exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String seminarId = extractSeminarId(session);
        if (seminarId != null) {
            Set<WebSocketSession> sessions = chatSessions.get(seminarId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    chatSessions.remove(seminarId);
                }
            }
        }
        System.out.println("Chat WebSocket disconnected: " + session.getId());
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    public static class ChatMessage {
        private String id;
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