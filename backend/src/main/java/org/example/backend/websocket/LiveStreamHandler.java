package org.example.backend.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class LiveStreamHandler implements WebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    // Seminar ID -> Set of WebSocket Sessions
    private final Map<String, CopyOnWriteArraySet<WebSocketSession>> seminarSessions = new ConcurrentHashMap<>();

    // Session ID -> User Info
    private final Map<String, UserInfo> sessionUsers = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String seminarId = extractSeminarId(session);
        if (seminarId != null) {
            seminarSessions.computeIfAbsent(seminarId, k -> new CopyOnWriteArraySet<>()).add(session);
            System.out.println("WebSocket connected for seminar: " + seminarId + ", Session: " + session.getId());
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String payload = message.getPayload().toString();
        System.out.println("Received WebSocket message: " + payload);
        Map<String, Object> data = objectMapper.readValue(payload, Map.class);

        String type = (String) data.get("type");
        String seminarId = extractSeminarId(session);
        System.out.println("Processing message type: " + type + " for seminar: " + seminarId);

        switch (type) {
            case "join":
                handleJoin(session, data, seminarId);
                break;
            case "offer":
                handleOffer(session, data, seminarId);
                break;
            case "answer":
                handleAnswer(session, data, seminarId);
                break;
            case "ice-candidate":
                handleIceCandidate(session, data, seminarId);
                break;
            case "instructor-stream-start":
                handleInstructorStreamStart(session, data, seminarId);
                break;
        }
    }

    private void handleJoin(WebSocketSession session, Map<String, Object> data, String seminarId) throws IOException {
        String username = (String) data.get("username");
        String role = (String) data.get("role");
        
        // Prüfe ob User bereits existiert
        UserInfo existingUser = sessionUsers.get(session.getId());
        if (existingUser != null && existingUser.username.equals(username)) {
            System.out.println("User already joined, skipping: " + username);
            return;
        }
        
        UserInfo userInfo = new UserInfo(username, role);
        sessionUsers.put(session.getId(), userInfo);
        System.out.println("User joined: " + username + " (" + role + ") - Session: " + session.getId());
        
        // Benachrichtige alle anderen Teilnehmer
        Map<String, Object> joinMessage = Map.of(
            "type", "user-joined",
            "username", username,
            "role", role,
            "sessionId", session.getId()
        );
        
        broadcastToSeminar(seminarId, joinMessage, session);
    }

    private void handleOffer(WebSocketSession session, Map<String, Object> data, String seminarId) throws IOException {
        String targetSessionId = (String) data.get("target");
        data.put("from", session.getId());

        sendToSession(targetSessionId, data);
    }

    private void handleAnswer(WebSocketSession session, Map<String, Object> data, String seminarId) throws IOException {
        String targetSessionId = (String) data.get("target");
        data.put("from", session.getId());

        sendToSession(targetSessionId, data);
    }

    private void handleIceCandidate(WebSocketSession session, Map<String, Object> data, String seminarId) throws IOException {
        String targetSessionId = (String) data.get("target");
        data.put("from", session.getId());

        sendToSession(targetSessionId, data);
    }

    private void handleInstructorStreamStart(WebSocketSession session, Map<String, Object> data, String seminarId) throws IOException {
        UserInfo userInfo = sessionUsers.get(session.getId());
        if (userInfo != null && "INSTRUCTOR".equals(userInfo.role)) {
            // Benachrichtige alle Studenten dass Dozent live geht
            Map<String, Object> streamMessage = Map.of(
                    "type", "instructor-stream-available",
                    "instructorSessionId", session.getId()
            );

            broadcastToSeminar(seminarId, streamMessage, session);
        }
    }

    private void broadcastToSeminar(String seminarId, Map<String, Object> message, WebSocketSession excludeSession) throws IOException {
        CopyOnWriteArraySet<WebSocketSession> sessions = seminarSessions.get(seminarId);
        if (sessions != null) {
            String messageJson = objectMapper.writeValueAsString(message);
            for (WebSocketSession session : sessions) {
                if (session.isOpen() && !session.equals(excludeSession)) {
                    session.sendMessage(new TextMessage(messageJson));
                }
            }
        }
    }

    private void sendToSession(String sessionId, Map<String, Object> message) throws IOException {
        for (CopyOnWriteArraySet<WebSocketSession> sessions : seminarSessions.values()) {
            for (WebSocketSession session : sessions) {
                if (session.getId().equals(sessionId) && session.isOpen()) {
                    String messageJson = objectMapper.writeValueAsString(message);
                    session.sendMessage(new TextMessage(messageJson));
                    return;
                }
            }
        }
    }

    private String extractSeminarId(WebSocketSession session) {
        String path = session.getUri().getPath();
        System.out.println("WebSocket path: " + path);
        String[] parts = path.split("/");
        System.out.println("Path parts: " + java.util.Arrays.toString(parts));
        String seminarId = parts.length > 3 ? parts[3] : null;
        System.out.println("Extracted seminar ID: " + seminarId);
        return seminarId;
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        System.err.println("WebSocket transport error: " + exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String seminarId = extractSeminarId(session);
        if (seminarId != null) {
            CopyOnWriteArraySet<WebSocketSession> sessions = seminarSessions.get(seminarId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    seminarSessions.remove(seminarId);
                }
            }
        }
        sessionUsers.remove(session.getId());
        System.out.println("WebSocket disconnected: " + session.getId());
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    private static class UserInfo {
        public final String username;
        public final String role;

        public UserInfo(String username, String role) {
            this.username = username;
            this.role = role;
        }
    }
}