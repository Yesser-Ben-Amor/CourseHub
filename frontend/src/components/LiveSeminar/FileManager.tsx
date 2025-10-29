import React, { useState, useRef } from 'react';
import type { SeminarFile, User } from '../../types/seminar.types';

interface FileManagerProps {
    files: SeminarFile[];
    user: User | null;
    isInstructor: boolean;
    onFileUpload: (file: File, uploadedBy: string, description?: string) => Promise<void>;
    onFileDelete?: (fileId: number) => Promise<void>;
}

interface UploadState {
    isUploading: boolean;
    progress: number;
    error: string | null;
}

const FileManager: React.FC<FileManagerProps> = ({
                                                     files,
                                                     user,
                                                     isInstructor,
                                                     onFileUpload,
                                                     onFileDelete
                                                 }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: 0,
        error: null
    });
    const [dragActive, setDragActive] = useState(false);
    const [description, setDescription] = useState('');

    const handleFileSelect = (selectedFiles: FileList | null): void => {
        if (!selectedFiles || selectedFiles.length === 0 || !user) return;

        const file = selectedFiles[0];
        uploadFile(file);
    };

    const uploadFile = async (file: File): Promise<void> => {
        if (!user) return;

        setUploadState({ isUploading: true, progress: 0, error: null });

        try {
            await onFileUpload(file, user.username, description);
            setDescription('');
            setUploadState({ isUploading: false, progress: 100, error: null });

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload fehlgeschlagen';
            setUploadState({ isUploading: false, progress: 0, error: errorMessage });
        }
    };

    const handleDragEnter = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDragOver = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = e.dataTransfer.files;
        handleFileSelect(droppedFiles);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType: string): string => {
        switch (fileType.toLowerCase()) {
            case 'pdf': return '📄';
            case 'image': return '🖼️';
            case 'video': return '🎥';
            case 'document': return '📝';
            default: return '📁';
        }
    };

    const handleDeleteFile = async (fileId: number): Promise<void> => {
        if (!onFileDelete) return;

        try {
            await onFileDelete(fileId);
        } catch (error) {
            console.error('Fehler beim Löschen der Datei:', error);
        }
    };

    return (
        <div className="file-manager">
            {/* Upload Area - nur für Instructors */}
            {isInstructor && (
                <div className="upload-section">
                    <div
                        className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadState.isUploading ? 'uploading' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={(e) => handleFileSelect(e.target.files)}
                            style={{ display: 'none' }}
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                            disabled={uploadState.isUploading}
                        />

                        {uploadState.isUploading ? (
                            <div className="upload-progress">
                                <div className="upload-spinner">⏳</div>
                                <p>Datei wird hochgeladen...</p>
                            </div>
                        ) : (
                            <div className="upload-content">
                                <div className="upload-icon">📁</div>
                                <p>Datei hier ablegen oder klicken zum Auswählen</p>
                                <small>PDF, Bilder, Videos, Dokumente</small>
                            </div>
                        )}
                    </div>

                    {/* Description Input */}
                    <div className="upload-description">
                        <input
                            type="text"
                            placeholder="Beschreibung (optional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={uploadState.isUploading}
                        />
                    </div>

                    {/* Upload Error */}
                    {uploadState.error && (
                        <div className="upload-error">
                            ❌ {uploadState.error}
                        </div>
                    )}
                </div>
            )}

            {/* Files List */}
            <div className="files-list">
                <div className="files-header">
                    <h3>📁 Dateien ({files.length})</h3>
                </div>

                {files.length === 0 ? (
                    <div className="no-files">
                        <p>Noch keine Dateien hochgeladen</p>
                    </div>
                ) : (
                    <div className="files-grid">
                        {files.map(file => (
                            <div key={file.id} className="file-item">
                                <div className="file-header">
                                    <span className="file-icon">
                                        {getFileIcon(file.fileType)}
                                    </span>
                                    <div className="file-info">
                                        <h4 className="file-name" title={file.fileName}>
                                            {file.fileName}
                                        </h4>
                                        <div className="file-meta">
                                            <span className="file-size">
                                                {formatFileSize(file.fileSize)}
                                            </span>
                                            <span className="file-type">
                                                {file.fileType}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="file-details">
                                    <div className="file-uploader">
                                        👤 {file.uploadedBy}
                                    </div>
                                    <div className="file-time">
                                        🕒 {new Date(file.uploadTime).toLocaleString('de-DE')}
                                    </div>
                                    {file.description && (
                                        <div className="file-description">
                                            💬 {file.description}
                                        </div>
                                    )}
                                </div>

                                <div className="file-actions">
                                    <button
                                        className="action-btn download-btn"
                                        onClick={() => window.open(`/api/seminars/files/${file.id}/download`, '_blank')}
                                        title="Herunterladen"
                                    >
                                        ⬇️
                                    </button>

                                    {isInstructor && onFileDelete && (
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() => handleDeleteFile(file.id)}
                                            title="Löschen"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileManager;