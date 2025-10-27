package org.example.backend.service;

import org.example.backend.entity.SeminarEntity;
import org.example.backend.repository.SeminarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SeminarService {

    private final SeminarRepository seminarRepository;

    public SeminarService(SeminarRepository seminarRepository) {
        this.seminarRepository = seminarRepository;
    }

    // Alle Seminare abrufen
    public List<SeminarEntity> getAllSeminars() {
        return seminarRepository.findAll();
    }

    // Kommende Seminare
    public List<SeminarEntity> getUpcomingSeminars() {
        return seminarRepository.findByStartTimeAfterOrderByStartTimeAsc(LocalDateTime.now());
    }

    // Live Seminare
    public List<SeminarEntity> getLiveSeminars() {
        return seminarRepository.findLiveSeminars(LocalDateTime.now());
    }

    // Seminare heute
    public List<SeminarEntity> getTodaysSeminars() {
        return seminarRepository.findSeminarsToday(LocalDateTime.now());
    }

    // Seminar nach ID
    public Optional<SeminarEntity> getSeminarById(Long id) {
        return seminarRepository.findById(id);
    }

    // Neues Seminar erstellen
    @Transactional
    public SeminarEntity createSeminar(String title, String description, String instructorName,
                                       LocalDateTime startTime, LocalDateTime endTime,
                                       Integer maxParticipants, String meetingUrl,
                                       String meetingId, String meetingPassword) {
        SeminarEntity seminar = new SeminarEntity();
        seminar.setTitle(title);
        seminar.setDescription(description);
        seminar.setInstructorName(instructorName);
        seminar.setStartTime(startTime);
        seminar.setEndTime(endTime);
        seminar.setMaxParticipants(maxParticipants);
        seminar.setMeetingUrl(meetingUrl);
        seminar.setMeetingId(meetingId);
        seminar.setMeetingPassword(meetingPassword);
        seminar.setStatus(SeminarEntity.SeminarStatus.SCHEDULED);

        return seminarRepository.save(seminar);
    }

    // Seminar aktualisieren
    @Transactional
    public SeminarEntity updateSeminar(Long id, String title, String description,
                                       String instructorName, LocalDateTime startTime,
                                       LocalDateTime endTime, Integer maxParticipants,
                                       String meetingUrl, String meetingId, String meetingPassword) {
        SeminarEntity seminar = seminarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seminar not found"));

        seminar.setTitle(title);
        seminar.setDescription(description);
        seminar.setInstructorName(instructorName);
        seminar.setStartTime(startTime);
        seminar.setEndTime(endTime);
        seminar.setMaxParticipants(maxParticipants);
        seminar.setMeetingUrl(meetingUrl);
        seminar.setMeetingId(meetingId);
        seminar.setMeetingPassword(meetingPassword);

        return seminarRepository.save(seminar);
    }

    // Seminar Status ändern
    @Transactional
    public SeminarEntity updateSeminarStatus(Long id, SeminarEntity.SeminarStatus status) {
        SeminarEntity seminar = seminarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seminar not found"));

        seminar.setStatus(status);
        return seminarRepository.save(seminar);
    }

    // Teilnehmer hinzufügen
    @Transactional
    public SeminarEntity joinSeminar(Long id) {
        SeminarEntity seminar = seminarRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seminar not found"));

        if (seminar.getCurrentParticipants() >= seminar.getMaxParticipants()) {
            throw new RuntimeException("Seminar is full");
        }

        seminar.setCurrentParticipants(seminar.getCurrentParticipants() + 1);
        return seminarRepository.save(seminar);
    }

    // Seminar löschen
    @Transactional
    public void deleteSeminar(Long id) {
        seminarRepository.deleteById(id);
    }
}