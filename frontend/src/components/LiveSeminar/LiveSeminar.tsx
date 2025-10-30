import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSeminar } from '../../hooks/useSeminar';
import VideoSection from './VideoSection';
import Whiteboard from './Whiteboard';
import type { User } from '../../types/seminar.types';
import '../../LiveSeminar.css';

const LiveSeminar: React.FC = () => {
    const navigate = useNavigate();
    const { seminarId } = useParams<{ seminarId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [isInstructor, setIsInstructor] = useState(false);
    const [activeView, setActiveView] = useState<'video' | 'whiteboard' | 'files'>('video');
    const [showUploadDialog, setShowUploadDialog] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadDescription, setUploadDescription] = useState<string>('');
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info' | null}>({message: '', type: null});
    const [confirmDialog, setConfirmDialog] = useState<{show: boolean, message: string, onConfirm: () => void}>({show: false, message: '', onConfirm: () => {}});

    // Custom Hook für Seminar-Daten
    const {
        loading,
        error,
        drawings,
        saveDrawing,
        clearWhiteboard,
        uploadFile,
        deleteFile,
        files
    } = useSeminar(seminarId || '');

    // User Setup
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            navigate('/');
            return;
        }

        try {
            const userData = JSON.parse(userStr);
            
            // Role setzen falls undefined (basierend auf Email)
            if (!userData.role) {
                userData.role = userData.email === 'teacher@courseHub.de' ? 'INSTRUCTOR' : 'STUDENT';
            }
            
            setUser(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/');
        }
    }, [navigate]);

    // Instructor Check
    useEffect(() => {
        if (user) {
            const isInstructor = user.email === 'teacher@courseHub.de' || user.role === 'INSTRUCTOR';
            setIsInstructor(isInstructor);
        }
    }, [user]);

    // Funktion zum Hochladen einer Datei
    const handleUpload = async () => {
        if (!selectedFile || !user) return;
        
        try {
            setIsUploading(true);
            await uploadFile(selectedFile, user.username, uploadDescription);
            
            // Reset nach erfolgreichem Upload
            setShowUploadDialog(false);
            setSelectedFile(null);
            setUploadDescription('');
            // Erfolgreiche Benachrichtigung anzeigen
            setNotification({
                message: 'Datei erfolgreich hochgeladen!',
                type: 'success'
            });
            
            // Benachrichtigung nach 3 Sekunden ausblenden
            setTimeout(() => {
                setNotification({message: '', type: null});
            }, 3000);
        } catch (error) {
            console.error('Fehler beim Hochladen:', error);
            setNotification({
                message: 'Fehler beim Hochladen der Datei. Bitte versuchen Sie es erneut.',
                type: 'error'
            });
            
            // Fehler-Benachrichtigung nach 5 Sekunden ausblenden
            setTimeout(() => {
                setNotification({message: '', type: null});
            }, 5000);
        } finally {
            setIsUploading(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="live-seminar-loading">
                <div className="loading-spinner">⏳</div>
                <p>Seminar wird geladen...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="live-seminar-error">
                <div className="error-icon">❌</div>
                <h2>Fehler beim Laden</h2>
                <p><strong>Fehler:</strong> {error}</p>
                <button onClick={() => navigate('/campus')} className="back-btn">
                    ← Zurück zum Campus
                </button>
            </div>
        );
    }

    // Debugging-Ausgabe hinzufügen
    console.log('Rendering LiveSeminar component', { isInstructor, user });
    
    return (
        <div className="live-seminar" style={{ position: 'relative' }}>
            {activeView === 'video' ? (
                <VideoSection 
                    isInstructor={isInstructor} 
                    user={user}
                    seminarId={seminarId || '1'}
                />
            ) : activeView === 'whiteboard' ? (
                <Whiteboard
                    drawings={drawings || []}
                    user={user}
                    isInstructor={isInstructor}
                    onSaveDrawing={saveDrawing}
                    onClearWhiteboard={clearWhiteboard}
                />
            ) : (
                <div className="files-container">
                    <div className="files-header">
                        <h2>Dateien</h2>
                        {files.length > 0 && isInstructor && (
                            <button 
                                className="clear-files-btn"
                                onClick={() => {
                                    // Bestätigungsdialog anzeigen
                                    setConfirmDialog({
                                        show: true,
                                        message: 'Möchten Sie wirklich ALLE Dateien löschen?',
                                        onConfirm: () => {
                                            // Zeige Info-Benachrichtigung an
                                            setNotification({
                                                message: 'Lösche alle Dateien...',
                                                type: 'info'
                                            });
                                        
                                        // Lösche alle Dateien nacheinander
                                        Promise.all(files.map(file => deleteFile(file.id)))
                                            .then(() => {
                                                // Erfolgsmeldung anzeigen
                                                setNotification({
                                                    message: 'Alle Dateien erfolgreich gelöscht!',
                                                    type: 'success'
                                                });
                                                
                                                // Benachrichtigung nach 3 Sekunden ausblenden
                                                setTimeout(() => {
                                                    setNotification({message: '', type: null});
                                                }, 3000);
                                            })
                                            .catch(error => {
                                                console.error('Fehler beim Löschen aller Dateien:', error);
                                                setNotification({
                                                    message: 'Fehler beim Löschen einiger Dateien.',
                                                    type: 'error'
                                                });
                                                
                                                // Benachrichtigung nach 5 Sekunden ausblenden
                                                setTimeout(() => {
                                                    setNotification({message: '', type: null});
                                                }, 5000);
                                            });
                                        }
                                    });
                                }}
                            >
                                Alle Dateien löschen
                            </button>
                        )}
                    </div>
                    {files.length === 0 ? (
                        <p className="no-files">Keine Dateien vorhanden</p>
                    ) : (
                        <div className="files-list">
                            {files.map((file, index) => (
                                <div key={index} className="file-item">
                                    <div className="file-content">
                                        <div className="file-icon">
                                            {file.fileType?.includes('image') ? '🖼️' : 
                                             file.fileType?.includes('pdf') ? '📄' : 
                                             file.fileType?.includes('video') ? '🎬' : 
                                             file.fileType?.includes('audio') ? '🎵' : '📁'}
                                        </div>
                                        <div className="file-details">
                                            <div className="file-name">{file.fileName}</div>
                                            <div className="file-meta">
                                                <span className="file-uploader">{file.uploadedBy}</span>
                                                <span className="file-date">{new Date(file.uploadDate).toLocaleDateString()}</span>
                                            </div>
                                            {file.description && (
                                                <div className="file-description">{file.description}</div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="file-actions">
                                        <button 
                                            className="file-download"
                                            onClick={() => {
                                                // Zeige Info-Benachrichtigung an
                                                setNotification({
                                                    message: 'Versuche Download zu starten...',
                                                    type: 'info'
                                                });
                                                
                                                // Verschiedene mögliche URLs testen
                                                const urls = [
                                                    `http://localhost:8080/api/seminars/${seminarId}/files/${file.id}/download`,
                                                    `http://localhost:8080/api/seminars/${seminarId}/files/download/${file.id}`,
                                                    `http://localhost:8080/api/files/${file.id}/download`
                                                ];
                                                
                                                // Öffne die erste URL in einem neuen Tab
                                                window.open(urls[0], '_blank');
                                                
                                                // Hinweis nach 3 Sekunden anzeigen
                                                setTimeout(() => {
                                                    setNotification({
                                                        message: 'Falls der Download nicht funktioniert, ist die Funktion im Backend nicht vollständig implementiert.',
                                                        type: 'info'
                                                    });
                                                }, 3000);
                                                
                                                // Benachrichtigung nach weiteren 5 Sekunden ausblenden
                                                setTimeout(() => {
                                                    setNotification({message: '', type: null});
                                                }, 8000);
                                            }}
                                        >
                                            Download
                                        </button>
                                        
                                        {isInstructor && (
                                            <button 
                                                className="file-delete"
                                                onClick={() => {
                                                    // Bestätigungsdialog anzeigen
                                                    setConfirmDialog({
                                                        show: true,
                                                        message: `Möchten Sie die Datei "${file.fileName}" wirklich löschen?`,
                                                        onConfirm: () => {
                                                            // Zeige Info-Benachrichtigung an
                                                            setNotification({
                                                                message: 'Lösche Datei...',
                                                                type: 'info'
                                                            });
                                                            
                                                            // Lösche die Datei
                                                            deleteFile(file.id)
                                                                .then(() => {
                                                                    // Erfolgsmeldung anzeigen
                                                                    setNotification({
                                                                        message: 'Datei erfolgreich gelöscht!',
                                                                        type: 'success'
                                                                    });
                                                                    
                                                                    // Benachrichtigung nach 3 Sekunden ausblenden
                                                                    setTimeout(() => {
                                                                        setNotification({message: '', type: null});
                                                                    }, 3000);
                                                                })
                                                                .catch(error => {
                                                                    console.error('Fehler beim Löschen:', error);
                                                                    setNotification({
                                                                        message: 'Fehler beim Löschen der Datei.',
                                                                        type: 'error'
                                                                    });
                                                                    
                                                                    // Benachrichtigung nach 5 Sekunden ausblenden
                                                                    setTimeout(() => {
                                                                        setNotification({message: '', type: null});
                                                                    }, 5000);
                                                                });
                                                        }
                                                    });
                                                }}
                                            >
                                                Löschen
                                            </button>
                                        )}
                                        
                                        <div className="file-info-panel">
                                            <div className="file-details-expanded">
                                                <p><strong>Dateiname:</strong> {file.fileName}</p>
                                                <p><strong>Typ:</strong> {file.fileType}</p>
                                                <p><strong>Größe:</strong> {Math.round(file.fileSize / 1024)} KB</p>
                                                <p><strong>Hochgeladen von:</strong> {file.uploadedBy}</p>
                                                <p><strong>Datum:</strong> {new Date(file.uploadTime).toLocaleString()}</p>
                                                {file.description && (
                                                    <p><strong>Beschreibung:</strong> {file.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* Modernes Menü in der Mitte unten */}
            <div className="side-menu">
                <button 
                    className={`side-menu-button ${activeView === 'whiteboard' ? 'active' : ''}`}
                    onClick={() => setActiveView(activeView === 'whiteboard' ? 'video' : 'whiteboard')}
                >
                    {activeView === 'whiteboard' ? 'Zurück zum Video' : 'Whiteboard öffnen'}
                </button>
                
                <button 
                    className="side-menu-button screen-share-btn"
                    onClick={() => {
                        console.log('💻 Bildschirm teilen Button geklickt');
                        // Wenn wir nicht in der Video-Ansicht sind, wechseln wir zuerst dorthin
                        if (activeView !== 'video') {
                            console.log('💻 Wechsle zur Video-Ansicht');
                            setActiveView('video');
                            // Nach kurzer Verzögerung die Bildschirmfreigabe starten
                            setTimeout(() => {
                                console.log('💻 Löse Event aus (nach Verzögerung)');
                                // Direkter Zugriff auf die VideoSection-Komponente über ein globales Event
                                const event = new CustomEvent('toggle-screen-sharing');
                                document.dispatchEvent(event);
                                
                                // Zeige eine Benachrichtigung, falls das Event nicht verarbeitet wird
                                setTimeout(() => {
                                    console.log('💻 Prüfe, ob Event verarbeitet wurde');
                                }, 500);
                            }, 300);
                        } else {
                            console.log('💻 Bereits in Video-Ansicht, löse Event direkt aus');
                            // Direkter Zugriff auf die VideoSection-Komponente über ein globales Event
                            try {
                                const event = new CustomEvent('toggle-screen-sharing');
                                document.dispatchEvent(event);
                                console.log('💻 Event ausgelöst');
                            } catch (error) {
                                console.error('❌ Fehler beim Auslösen des Events:', error);
                                setNotification({
                                    message: 'Fehler beim Starten der Bildschirmfreigabe',
                                    type: 'error'
                                });
                                setTimeout(() => setNotification({message: '', type: null}), 3000);
                            }
                        }
                    }}
                >
                    Bildschirm teilen
                </button>
                
                <button 
                    className={`side-menu-button ${activeView === 'files' ? 'active' : ''}`}
                    onClick={() => setActiveView(activeView === 'files' ? 'video' : 'files')}
                >
                    {activeView === 'files' ? 'Zurück zum Video' : 'Dateien anzeigen'}
                </button>
                
                <button 
                    className="side-menu-button"
                    onClick={() => setShowUploadDialog(true)}
                    disabled={activeView !== 'files'}
                >
                    Datei hochladen
                </button>
                
                <button 
                    className="side-menu-button"
                    onClick={() => navigate('/campus')}
                >
                    Zurück zum Campus
                </button>
            </div>
            
            {/* Benachrichtigungen */}
            {notification.type && (
                <div className={`notification ${notification.type}`}>
                    {notification.type === 'success' && <span className="notification-icon">✅</span>}
                    {notification.type === 'error' && <span className="notification-icon">❌</span>}
                    {notification.type === 'info' && <span className="notification-icon">ℹ️</span>}
                    <span className="notification-message">{notification.message}</span>
                </div>
            )}
            
            {/* Bestätigungsdialog */}
            {confirmDialog.show && (
                <div className="confirm-dialog-overlay">
                    <div className="confirm-dialog">
                        <div className="confirm-dialog-content">
                            <div className="confirm-dialog-message">{confirmDialog.message}</div>
                        </div>
                        <div className="confirm-dialog-actions">
                            <button 
                                className="confirm-dialog-cancel"
                                onClick={() => setConfirmDialog({show: false, message: '', onConfirm: () => {}})}
                            >
                                Abbrechen
                            </button>
                            <button 
                                className="confirm-dialog-confirm"
                                onClick={() => {
                                    confirmDialog.onConfirm();
                                    setConfirmDialog({show: false, message: '', onConfirm: () => {}});
                                }}
                            >
                                Bestätigen
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Upload-Dialog */}
            {showUploadDialog && (
                <div className="upload-dialog-overlay">
                    <div className="upload-dialog">
                        <h3>Datei hochladen</h3>
                        
                        <div className="upload-form">
                            <div className="upload-form-group">
                                <label htmlFor="file">Datei auswählen:</label>
                                <input 
                                    type="file" 
                                    id="file" 
                                    onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                                    disabled={isUploading}
                                />
                                {selectedFile && (
                                    <div className="selected-file">
                                        <span>{selectedFile.name}</span>
                                        <span className="file-size">({Math.round(selectedFile.size / 1024)} KB)</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="upload-form-group">
                                <label htmlFor="description">Beschreibung (optional):</label>
                                <textarea 
                                    id="description" 
                                    value={uploadDescription}
                                    onChange={(e) => setUploadDescription(e.target.value)}
                                    disabled={isUploading}
                                    placeholder="Beschreibung der Datei..."
                                    rows={3}
                                />
                            </div>
                            
                            <div className="upload-actions">
                                <button 
                                    className="upload-cancel" 
                                    onClick={() => setShowUploadDialog(false)}
                                    disabled={isUploading}
                                >
                                    Abbrechen
                                </button>
                                <button 
                                    className="upload-submit" 
                                    onClick={handleUpload}
                                    disabled={!selectedFile || isUploading}
                                >
                                    {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveSeminar;