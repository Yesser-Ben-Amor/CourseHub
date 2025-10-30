import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WebRTCService } from '../../sevices/WebRTCService';
import type { User } from '../../types/seminar.types';

interface VideoSectionProps {
    isInstructor?: boolean;
    user: User | null;
    seminarId: string;
}

interface RemoteStream {
    stream: MediaStream;
    sessionId: string;
    username: string;
}

// Remote Video Component
const RemoteVideo: React.FC<{ remoteStream: RemoteStream }> = ({ remoteStream }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isScreenShare, setIsScreenShare] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);
    const [hasAudio, setHasAudio] = useState(false);
    
    useEffect(() => {
        console.log('📺 RemoteVideo useEffect triggered:', {
            hasVideoRef: !!videoRef.current,
            hasStream: !!remoteStream.stream,
            streamId: remoteStream.stream?.id,
            streamActive: remoteStream.stream?.active,
            trackCount: remoteStream.stream?.getTracks().length
        });
        
        if (videoRef.current && remoteStream.stream) {
            console.log('📺 Setting remote video stream for:', remoteStream.sessionId);
            
            const video = videoRef.current;
            video.srcObject = remoteStream.stream;
            
            // Tracks analysieren
            const videoTracks = remoteStream.stream.getVideoTracks();
            const audioTracks = remoteStream.stream.getAudioTracks();
            
            setHasVideo(videoTracks.length > 0);
            setHasAudio(audioTracks.length > 0);
            
            // Prüfen, ob es sich um einen Bildschirm-Stream handelt
            const isScreenShareStream = videoTracks.some(track => 
                track.label.toLowerCase().includes('screen') || 
                track.label.toLowerCase().includes('display') ||
                track.label.toLowerCase().includes('window')
            );
            
            setIsScreenShare(isScreenShareStream);
            
            // Video-Tracks explizit aktivieren
            videoTracks.forEach(track => {
                console.log('🎥 Activating video track:', track.id, track.label);
                track.enabled = true;
            });
            
            // Audio-Tracks aktivieren
            audioTracks.forEach(track => {
                console.log('🎤 Activating audio track:', track.id, track.label);
                track.enabled = true;
            });
            
            // Detaillierte Video-Element Diagnostics
            console.log('🔍 Video element diagnostics:', {
                hasVideoRef: !!video,
                srcObject: !!video.srcObject,
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                readyState: video.readyState,
                paused: video.paused,
                muted: video.muted
            });
            
            // Force play with muted fallback
            const tryPlay = async () => {
                try {
                    // Erst mit Audio versuchen, wenn vorhanden
                    if (audioTracks.length > 0) {
                        video.muted = false;
                    } else {
                        video.muted = true;
                    }
                    
                    await video.play();
                    console.log('✅ Remote video playing successfully');
                    
                    // Post-play diagnostics
                    setTimeout(() => {
                        console.log('🔍 Post-play diagnostics:', {
                            videoWidth: video.videoWidth,
                            videoHeight: video.videoHeight,
                            readyState: video.readyState,
                            paused: video.paused,
                            muted: video.muted,
                            videoTracks: videoTracks.length,
                            audioTracks: audioTracks.length
                        });
                        
                        // Wenn Video-Dimensionen immer noch 0, versuche verschiedene Fixes
                        if (videoTracks.length > 0 && video.videoWidth === 0 && video.videoHeight === 0) {
                            console.log('⚠️ Video dimensions still 0x0, trying fixes...');
                            
                            // Fix: Re-assign srcObject
                            const currentStream = video.srcObject;
                            video.srcObject = null;
                            setTimeout(() => {
                                video.srcObject = currentStream;
                                video.play().catch(e => console.log('Re-play failed:', e));
                            }, 500);
                        }
                    }, 1000);
                    
                } catch (error) {
                    console.warn('⚠️ Remote video autoplay failed, trying muted:', error);
                    video.muted = true;
                    try {
                        await video.play();
                        console.log('✅ Remote video playing muted');
                    } catch (mutedError) {
                        console.error('❌ Even muted autoplay failed:', mutedError);
                    }
                }
            };
            
            tryPlay();
        } else {
            console.error('❌ RemoteVideo: Missing videoRef or stream');
        }
    }, [remoteStream.stream]);
    
    return (
        <div className={`remote-video-container ${isScreenShare ? 'screen-share' : ''}`}>
            <div className="screen-share-container">
                <div className="screen-share-placeholder">
                    {/* Hier kann später der Bildschirminhalt angezeigt werden */}
                </div>
            </div>
            <div className="screen-share-container">
                <div className="screen-share-placeholder">
                    {/* Hier kann später der Bildschirminhalt angezeigt werden */}
                </div>
            </div>
            <video 
                ref={videoRef}
                autoPlay 
                playsInline
                controls={true}
                className={`remote-video ${isScreenShare ? 'screen-share' : ''}`}
            />
            <div className="video-overlay">
                <div className="stream-type-indicator">
                    {isScreenShare ? '💻 Bildschirmübertragung' : ''}
                </div>
                <div className="video-label">
                    {remoteStream.username || 'Remote User'}
                    {hasAudio && <span className="audio-indicator"> 🎤</span>}
                </div>
            </div>
        </div>
    );
};

const VideoSection: React.FC<VideoSectionProps> = ({ 
    isInstructor = false, 
    user,
    seminarId
}) => {
    console.log('🔴 VideoSection PROPS:', {
        isInstructor,
        user: user?.username,
        email: user?.email,
        seminarId
    });
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const [webRTCService, setWebRTCService] = useState<WebRTCService | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info' | null}>({message: '', type: null});
    const [participants, setParticipants] = useState<Array<{username: string, role: string}>>([]);
    
    // State für Bildschirmteilen
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    console.log('VideoSection - isInstructor:', isInstructor, 'user:', user?.username);

    // WebRTC Setup
    useEffect(() => {
        if (!user) return;

        // Cleanup previous service
        if (webRTCService) {
            webRTCService.disconnect();
            setWebRTCService(null);
        }

        const initWebRTC = async () => {
            try {
                // Role basierend auf isInstructor prop bestimmen
                const userRole = isInstructor ? 'INSTRUCTOR' : 'STUDENT';
                console.log('VideoSection - Creating WebRTC with role:', userRole, 'isInstructor:', isInstructor, 'user.role:', user.role);
                
                const service = new WebRTCService(
                    seminarId,
                    user.username,
                    userRole
                );

                // Setup callbacks
                service.onRemoteStream = (stream: MediaStream, sessionId: string) => {
                    console.log('Received remote stream from:', sessionId);
                    const newRemoteStream = { stream, sessionId, username: `User-${sessionId.slice(0, 8)}` };
                    console.log('📥 Adding remote stream to state:', newRemoteStream);
                    setRemoteStreams(prev => {
                        const filtered = prev.filter(rs => rs.sessionId !== sessionId);
                        const updated = [...filtered, newRemoteStream];
                        console.log('📺 Updated remoteStreams:', updated.length, 'streams');
                        return updated;
                    });
                };

                service.onUserJoined = (username: string, role: string) => {
                    console.log('User joined:', username, role);
                    setParticipants(prev => [
                        ...prev.filter(p => p.username !== username),
                        { username, role }
                    ]);
                };

                service.onInstructorStreamAvailable = () => {
                    console.log('Instructor stream is now available');
                };
                
                // Bildschirmteilen-Events
                service.onScreenShareStart = () => {
                    console.log('💻 Dozent teilt Bildschirm');
                };
                
                service.onScreenShareStop = () => {
                    console.log('💻 Dozent hat Bildschirmteilen beendet');
                    // Video-Element aktualisieren
                    setTimeout(() => {
                        const videoElements = document.querySelectorAll('video');
                        videoElements.forEach(video => {
                            if (video.srcObject) {
                                const currentStream = video.srcObject;
                                video.srcObject = null;
                                setTimeout(() => {
                                    video.srcObject = currentStream;
                                    video.play().catch(e => console.log('Video restart failed:', e));
                                }, 100);
                            }
                        });
                    }, 500);
                };

                await service.connect();
                setWebRTCService(service);
                setIsConnected(true);
                setError(null);

            } catch (error) {
                console.error('WebRTC initialization failed:', error);
                setError('Verbindung zum Live-Stream fehlgeschlagen');
            }
        };

        initWebRTC();

        return () => {
            webRTCService?.disconnect();
        };
    }, [user, seminarId, isInstructor]);

    // Video-Element mit Stream verbinden sobald verfügbar
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            console.log('🔗 Connecting local stream to video element');
            localVideoRef.current.srcObject = localStream;
            
            // Force play
            localVideoRef.current.play().catch(error => {
                console.warn('⚠️ Video autoplay failed:', error);
            });
        }
    }, [localStream]);
    
    // Screen-Video-Element mit Screen-Stream verbinden sobald verfügbar
    useEffect(() => {
        if (screenVideoRef.current && screenStream) {
            console.log('🔗 Connecting screen stream to video element');
            screenVideoRef.current.srcObject = screenStream;
            
            // Force play
            screenVideoRef.current.play().catch(error => {
                console.warn('⚠️ Screen video autoplay failed:', error);
            });
        }
    }, [screenStream]);

    // startLocalStream Funktion wurde entfernt

    const toggleVideo = (): void => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
            }
        }
    };

    const toggleAudio = (): void => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
            }
        }
    };
    
    // State für Bildschirmfreigabe-Optionen
    const [showScreenShareOptions, setShowScreenShareOptions] = useState<boolean>(false);
    const [screenShareType, setScreenShareType] = useState<'monitor' | 'window' | 'browser'>('monitor');
    
    // Browser-Erkennung
    const isChrome = navigator.userAgent.indexOf('Chrome') > -1 && navigator.userAgent.indexOf('Firefox') === -1;
    const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

    // Bildschirmteilen-Menü anzeigen/ausblenden
    const toggleScreenShareMenu = (): void => {
        if (isScreenSharing) {
            // Wenn bereits geteilt wird, direkt stoppen
            stopScreenSharing();
        } else {
            // Sonst Menü anzeigen/ausblenden
            setShowScreenShareOptions(!showScreenShareOptions);
        }
    };

    // Bildschirmteilen starten mit ausgewähltem Typ
    const startScreenSharing = async (type: 'monitor' | 'window' | 'browser'): Promise<void> => {
        if (!webRTCService || !isConnected) {
            const errorMsg = 'Verbindung nicht hergestellt';
            console.error('❌ ' + errorMsg);
            setError(errorMsg);
            return;
        }
        
        try {
            // Menü ausblenden und Benachrichtigung anzeigen
            setShowScreenShareOptions(false);
            setScreenShareType(type);
            
            // Benachrichtigung anzeigen
            setNotification({
                message: `Starte Bildschirmfreigabe (${type === 'monitor' ? 'Bildschirm' : type === 'window' ? 'Fenster' : 'Tab'})...`,
                type: 'info'
            });
            
            // Bildschirmteilen starten
            console.log(`💻 Starting screen sharing (${type})...`);
            console.log('💻 WebRTCService instance:', !!webRTCService);
            
            // Direkter Aufruf der Browser-API als Fallback
            let stream;
            try {
                stream = await webRTCService.startScreenSharing(type);
                console.log('💻 Stream from WebRTCService:', !!stream);
            } catch (innerError) {
                console.error('❌ Error from WebRTCService:', innerError);
                
                // Fallback: Direkt die Browser-API verwenden mit minimalen Optionen
                console.log('💻 Trying direct browser API as fallback...');
                
                // Prüfen, ob Chrome verwendet wird
                const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
                
                // Für Chrome vereinfachte Optionen verwenden
                const displayMediaOptions: DisplayMediaStreamOptions = {
                    video: {
                        cursor: 'always'
                    },
                    audio: true
                };
                
                // Nur für Firefox und andere Browser displaySurface hinzufügen
                if (!isChrome) {
                    (displayMediaOptions.video as MediaTrackConstraints).displaySurface = type;
                }
                
                try {
                    stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
                } catch (chromeError) {
                    console.error('❌ Chrome specific error:', chromeError);
                    
                    // Letzte Chance: Absolut minimale Optionen
                    console.log('💻 Last resort: Using minimal options');
                    stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                }
                console.log('💻 Stream from direct API:', !!stream);
            }
            
            if (stream) {
                // Stream-State aktualisieren - useEffect wird sich um das Video-Element kümmern
                setScreenStream(stream);
                setIsScreenSharing(true);
                console.log('✅ Screen sharing started successfully');
                
                // Erfolgsmeldung
                setNotification({
                    message: 'Bildschirmfreigabe erfolgreich gestartet',
                    type: 'success'
                });
                setTimeout(() => setNotification({message: '', type: null}), 3000);
            } else {
                throw new Error('Kein Stream erhalten');
            }
        } catch (error) {
            console.error('❌ Error starting screen sharing:', error);
            setError(`Fehler beim Bildschirmteilen: ${error instanceof Error ? error.message : String(error)}`);
            
            // Fehlermeldung
            setNotification({
                message: `Fehler bei der Bildschirmfreigabe: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
                type: 'error'
            });
            setTimeout(() => setNotification({message: '', type: null}), 5000);
        }
    };
    
    // Bildschirmteilen stoppen
    const stopScreenSharing = async (): Promise<void> => {
        if (!webRTCService) return;
        
        try {
            webRTCService.stopScreenSharing();
            setScreenStream(null);
            setIsScreenSharing(false);
            console.log('💻 Screen sharing stopped');
        } catch (error) {
            console.error('❌ Error stopping screen sharing:', error);
            setError('Fehler beim Beenden des Bildschirmteilens');
        }
    };
    
    // Alte toggleScreenSharing-Methode für Kompatibilität
    const toggleScreenSharing = async (): Promise<void> => {
        if (isScreenSharing) {
            await stopScreenSharing();
        } else {
            setShowScreenShareOptions(true);
        }
    };
    
    // Funktion zum direkten Starten der Bildschirmfreigabe ohne Menü
    const handleDirectScreenSharing = useCallback(async () => {
        console.log('📡 Handling direct screen sharing');
        try {
            if (isScreenSharing) {
                console.log('💻 Stopping screen sharing directly');
                await stopScreenSharing();
            } else {
                console.log('💻 Starting screen sharing directly');
                // Direkt den gesamten Bildschirm teilen ohne Menü
                await startScreenSharing('monitor');
            }
        } catch (error) {
            console.error('❌ Error in handleDirectScreenSharing:', error);
            setError('Fehler bei der Bildschirmfreigabe: ' + (error instanceof Error ? error.message : String(error)));
        }
    }, [isScreenSharing, stopScreenSharing, startScreenSharing]);
    
    // Event-Listener für globales Event
    useEffect(() => {
        const handleToggleScreenSharing = () => {
            console.log('📡 Received toggle-screen-sharing event');
            handleDirectScreenSharing();
        };
        
        console.log('📝 Adding event listener for toggle-screen-sharing');
        document.addEventListener('toggle-screen-sharing', handleToggleScreenSharing);
        
        return () => {
            console.log('📝 Removing event listener for toggle-screen-sharing');
            document.removeEventListener('toggle-screen-sharing', handleToggleScreenSharing);
        };
    }, [handleDirectScreenSharing]); // Abhängigkeit vom Callback

    const stopStream = (): void => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            setIsStreaming(false);
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
        }
    };

    return (
        <div className="video-section-container">
            {error && (
                <div className="error-banner">
                    ⚠️ {error}
                </div>
            )}
            
            {/* Benachrichtigungen */}
            {notification.type && (
                <div className={`notification ${notification.type}`}>
                    {notification.type === 'success' && <span className="notification-icon">✅</span>}
                    {notification.type === 'error' && <span className="notification-icon">❌</span>}
                    {notification.type === 'info' && <span className="notification-icon">ℹ️</span>}
                    <span className="notification-message">{notification.message}</span>
                </div>
            )}
            
            {/* Zentriertes dunkles Div für Bildschirmteilen */}
            <div className="screen-share-container">
                {isScreenSharing && screenStream ? (
                    <div className="active-screen-share">
                        <div className="screen-share-header">
                            <span className="screen-share-status">Bildschirmfreigabe aktiv</span>
                            {isInstructor && (
                                <button 
                                    className="screen-share-stop-btn"
                                    onClick={stopScreenSharing}
                                >
                                    Beenden
                                </button>
                            )}
                        </div>
                        <video 
                            ref={screenVideoRef}
                            className="screen-share-video"
                            autoPlay
                            playsInline
                            muted={false}
                            controls={false}
                        />
                    </div>
                ) : (
                    <div className="screen-share-placeholder">
                        {/* Platzhalter wenn kein Bildschirm geteilt wird */}
                        <div className="screen-share-placeholder-text">
                            {isInstructor ? 'Klicken Sie auf "Bildschirm teilen", um Ihren Bildschirm zu teilen' : 'Warten auf Bildschirmfreigabe...'}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Controls Bar */}
            <div className="meet-controls-bar">
                {localStream && (
                    <>
                        <button
                            onClick={toggleAudio}
                            className={`meet-control-button ${localStream.getAudioTracks()[0]?.enabled ? '' : 'active'}`}
                            aria-label={`Audio ${localStream.getAudioTracks()[0]?.enabled ? 'ausschalten' : 'einschalten'}`}
                        >
                            {localStream.getAudioTracks()[0]?.enabled ? '🎤 Audio an' : '🎤❌ Audio aus'}
                        </button>
                        
                        {isInstructor && (
                            <div className="screen-share-dropdown">
                                <button
                                    onClick={toggleScreenShareMenu}
                                    className={`meet-control-button ${isScreenSharing ? 'active' : ''}`}
                                    aria-label={isScreenSharing ? 'Bildschirmteilen beenden' : 'Bildschirm teilen'}
                                >
                                    💻 {isScreenSharing ? 'Bildschirm stoppen' : 'Bildschirm teilen'}
                                </button>
                                
                                {showScreenShareOptions && !isScreenSharing && (
                                    <div className="screen-share-options">
                                        <button 
                                            className="screen-share-option"
                                            onClick={() => startScreenSharing('monitor')}
                                        >
                                            💻 Gesamter Bildschirm
                                        </button>
                                        <button 
                                            className="screen-share-option"
                                            onClick={() => startScreenSharing('window')}
                                        >
                                            💻 Fenster
                                        </button>
                                        <button 
                                            className={`screen-share-option ${isChrome ? 'chrome-warning' : ''}`}
                                            onClick={() => startScreenSharing('browser')}
                                            title={isChrome ? 'In Chrome können nur Tabs im gleichen Fenster geteilt werden' : ''}
                                        >
                                            💻 Browser-Tab
                                            {isChrome && <span className="chrome-tab-note">*</span>}
                                        </button>
                                        
                                        {navigator.userAgent.indexOf('Chrome') > -1 && (
                                            <div className="chrome-hint">
                                                <p>Hinweis für Chrome-Nutzer:</p>
                                                <ul>
                                                    <li>Chrome erlaubt nur das Teilen von Tabs, die sich im <strong>gleichen Fenster</strong> wie diese Anwendung befinden</li>
                                                    <li>Öffnen Sie Webseiten, die Sie teilen möchten, im gleichen Chrome-Fenster</li>
                                                    <li>Für das Teilen von Tabs aus anderen Fenstern verwenden Sie bitte Firefox</li>
                                                    <li>Erteilen Sie alle notwendigen Berechtigungen im Chrome-Dialog</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <button
                            onClick={stopStream}
                            className="meet-control-button red"
                            aria-label="Stream beenden"
                        >
                            ⏹ Stream beenden
                        </button>
                    </>
                )}
                
                {/* Keine Steuerelemente für nicht gestarteten Stream */}
            </div>
        </div>
    );
};

export default VideoSection;