export interface Seminar {
    id: number;
    title: string;
    description: string;
    instructorName: string;
    startTime: string;
    endTime: string;
    maxParticipants: number;
    currentParticipants: number;
    meetingUrl: string;
    status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface SeminarFile {
    id: number;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    uploadTime: string;
    description?: string;
}

export interface StudentSubmission {
    id: number;
    studentName: string;
    title: string;
    description?: string;
    submissionType: 'LINK' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    contentUrl: string;
    fileName?: string;
    submissionTime: string;
    grade?: number;
    instructorFeedback?: string;
}

export interface WhiteboardDrawing {
    id: number;
    drawingData: string;
    drawnBy: string;
    drawTime: string;
    actionType: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export type TabType = 'video' | 'files' | 'whiteboard' | 'submissions';

// Neue spezifische Types für Forms
export interface SubmissionFormData {
    studentId: number;
    studentName: string;
    title: string;
    description?: string;
    type: 'LINK' | 'FILE';
    url?: string;
    file?: File; // undefined statt null
}

export interface FileUploadData {
    file: File;
    uploadedBy: string;
    description?: string;
}

export interface WhiteboardSettings {
    brushColor: string;
    brushSize: number;
    isDrawing: boolean;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

export interface SeminarStats {
    totalParticipants: number;
    filesCount: number;
    submissionsCount: number;
    averageGrade?: number;
}