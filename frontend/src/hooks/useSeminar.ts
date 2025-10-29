import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Seminar, SeminarFile, StudentSubmission, WhiteboardDrawing } from '../types/seminar.types';

interface SubmissionData {
    studentId: number;
    studentName: string;
    title: string;
    description?: string;
    type: 'LINK' | 'FILE';
    url?: string;
    file?: File;
}

export const useSeminar = (seminarId: string) => {
    const [seminar, setSeminar] = useState<Seminar | null>(null);
    const [files, setFiles] = useState<SeminarFile[]>([]);
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [drawings, setDrawings] = useState<WhiteboardDrawing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadSeminar = async (): Promise<void> => {
        try {
            const response = await axios.get(`http://localhost:8080/api/seminars/${seminarId}`);
            setSeminar(response.data);
        } catch (error) {
            setError('Fehler beim Laden des Seminars');
            console.error('Seminar load error:', error);
        }
    };

    const loadFiles = async (): Promise<void> => {
        try {
            const response = await axios.get(`http://localhost:8080/api/seminars/${seminarId}/files`);
            setFiles(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Dateien:', error);
        }
    };

    const loadSubmissions = async (): Promise<void> => {
        try {
            const response = await axios.get(`http://localhost:8080/api/seminars/${seminarId}/submissions`);
            setSubmissions(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Abgaben:', error);
        }
    };

    const loadDrawings = async (): Promise<void> => {
        try {
            const response = await axios.get(`http://localhost:8080/api/seminars/${seminarId}/whiteboard`);
            setDrawings(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Zeichnungen:', error);
        }
    };

    const uploadFile = async (file: File, uploadedBy: string, description?: string): Promise<void> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploadedBy', uploadedBy);
        if (description) {
            formData.append('description', description);
        }

        try {
            await axios.post(`http://localhost:8080/api/seminars/${seminarId}/files/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await loadFiles();
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Upload fehlgeschlagen');
        }
    };

    const submitWork = async (submissionData: SubmissionData): Promise<void> => {
        try {
            if (submissionData.type === 'LINK') {
                await axios.post(`http://localhost:8080/api/seminars/${seminarId}/submissions/link`, submissionData);
            } else {
                const formData = new FormData();
                formData.append('studentId', submissionData.studentId.toString());
                formData.append('studentName', submissionData.studentName);
                formData.append('title', submissionData.title);
                if (submissionData.description) {
                    formData.append('description', submissionData.description);
                }
                if (submissionData.file) {
                    formData.append('file', submissionData.file);
                }
                await axios.post(`http://localhost:8080/api/seminars/${seminarId}/submissions/file`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            await loadSubmissions();
        } catch (error) {
            console.error('Submission error:', error);
            throw new Error('Abgabe fehlgeschlagen');
        }
    };

    const saveDrawing = async (drawingData: string, drawnBy: string): Promise<void> => {
        try {
            await axios.post(`http://localhost:8080/api/seminars/${seminarId}/whiteboard`, {
                drawingData,
                drawnBy,
                actionType: 'DRAW'
            });
        } catch (error) {
            console.error('Fehler beim Speichern der Zeichnung:', error);
        }
    };

    const clearWhiteboard = async (): Promise<void> => {
        try {
            await axios.delete(`http://localhost:8080/api/seminars/${seminarId}/whiteboard`);
            setDrawings([]);
        } catch (error) {
            console.error('Fehler beim Löschen des Whiteboards:', error);
        }
    };

    useEffect(() => {
        const loadData = async (): Promise<void> => {
            if (!seminarId) return;
            
            setLoading(true);
            await Promise.all([
                loadSeminar(),
                loadFiles(),
                loadSubmissions(),
                loadDrawings()
            ]);
            setLoading(false);
        };

        loadData();
    }, [seminarId]);

    // Datei löschen
    const deleteFile = async (fileId: number): Promise<void> => {
        try {
            await axios.delete(`http://localhost:8080/api/seminars/${seminarId}/files/${fileId}`);
            // Nach dem Löschen die Dateiliste aktualisieren
            await loadFiles();
        } catch (error) {
            console.error('Fehler beim Löschen der Datei:', error);
            throw new Error('Löschen fehlgeschlagen');
        }
    };

    return {
        seminar,
        files,
        submissions,
        drawings,
        loading,
        error,
        uploadFile,
        submitWork,
        saveDrawing,
        clearWhiteboard,
        deleteFile,
        refreshData: async (): Promise<void> => {
            await Promise.all([
                loadFiles(),
                loadSubmissions(),
                loadDrawings()
            ]);
        }
    };
};