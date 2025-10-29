interface WebSocketMessage {
    type: string;
}

interface JoinMessage extends WebSocketMessage {
    type: 'join';
    username: string;
    role: string;
}

interface OfferMessage extends WebSocketMessage {
    type: 'offer';
    offer: RTCSessionDescriptionInit;
    target: string;
}

interface AnswerMessage extends WebSocketMessage {
    type: 'answer';
    answer: RTCSessionDescriptionInit;
    target: string;
}

interface IceCandidateMessage extends WebSocketMessage {
    type: 'ice-candidate';
    candidate: RTCIceCandidateInit;
    target: string;
}

interface InstructorStreamStartMessage extends WebSocketMessage {
    type: 'instructor-stream-start';
}

interface UserJoinedMessage extends WebSocketMessage {
    type: 'user-joined';
    username: string;
    role: string;
    sessionId: string;
}

interface InstructorStreamAvailableMessage extends WebSocketMessage {
    type: 'instructor-stream-available';
    instructorSessionId: string;
}

interface ScreenShareStartMessage extends WebSocketMessage {
    type: 'screen-share-start';
}

interface ScreenShareStopMessage extends WebSocketMessage {
    type: 'screen-share-stop';
}

type WebRTCMessageType = 
    | JoinMessage 
    | OfferMessage 
    | AnswerMessage 
    | IceCandidateMessage 
    | InstructorStreamStartMessage 
    | UserJoinedMessage 
    | InstructorStreamAvailableMessage
    | ScreenShareStartMessage
    | ScreenShareStopMessage;

export class WebRTCService {
    // Neues Flag für Bildschirmteilen
    private screenStream: MediaStream | null = null;
    private isScreenSharing = false;
    private ws: WebSocket | null = null;
    private localStream: MediaStream | null = null;
    private peerConnections: Map<string, RTCPeerConnection> = new Map();
    private isInstructor: boolean = false;
    private seminarId: string = '';
    private username: string = '';
    private role: string = '';

    // Callbacks
    public onRemoteStream: ((stream: MediaStream, sessionId: string) => void) | null = null;
    public onUserJoined: ((username: string, role: string) => void) | null = null;
    public onInstructorStreamAvailable: (() => void) | null = null;
    public onScreenShareStart: (() => void) | null = null;
    public onScreenShareStop: (() => void) | null = null;

    constructor(seminarId: string, username: string, role: string) {
        this.seminarId = seminarId;
        this.username = username;
        this.role = role;
        this.isInstructor = role === 'INSTRUCTOR';
    }

    // Reconnect-Versuch-Zähler
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: any = null;
    
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.setupWebSocket(resolve, reject);
        });
    }
    
    private setupWebSocket(resolve?: (value: void | PromiseLike<void>) => void, reject?: (reason?: any) => void): void {
        const wsUrl = `ws://localhost:8080/ws/live-stream/${this.seminarId}`;
        console.log('🔗 Attempting WebSocket connection to:', wsUrl, 'Attempt:', this.reconnectAttempts + 1);
        
        // Bestehende Verbindung schließen falls vorhanden
        if (this.ws) {
            this.ws.close();
        }
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('✅ WebSocket connected successfully');
            this.reconnectAttempts = 0; // Zurücksetzen bei erfolgreicher Verbindung
            
            // Send join message
            this.sendMessage({
                type: 'join',
                username: this.username,
                role: this.role
            });

            // If instructor, notify students about stream availability
            if (this.isInstructor) {
                this.sendMessage({
                    type: 'instructor-stream-available'
                });
            }

            if (resolve) resolve();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('� Received message:', data.type);
            this.handleMessage(data);
        };

        this.ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
            if (reject) reject(error);
        };

        this.ws.onclose = (event) => {
            console.log('🔴 WebSocket disconnected, code:', event.code, 'reason:', event.reason);
            
            // Automatisch neu verbinden, wenn nicht absichtlich geschlossen
            if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000); // Exponentielles Backoff
                console.log(`🔄 Reconnecting in ${delay/1000} seconds...`);
                
                this.reconnectAttempts++;
                
                // Timeout für Wiederverbindung
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = setTimeout(() => {
                    console.log('🔄 Attempting to reconnect...');
                    this.setupWebSocket();
                }, delay);
            } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('❌ Maximum reconnect attempts reached');
            }
        };
    }

    async startLocalStream(): Promise<MediaStream> {
        try {
            // NEUE STRATEGIE: Nur Audio-Stream + Bildschirmteilen
            console.log('🎤 Starting audio-only stream...');
            
            // Nur Audio anfordern - optimiert für Sprachübertragung
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: false, // Kein Video mehr
                audio: {
                    echoCancellation: true,  // Echo unterdrücken
                    noiseSuppression: true,  // Hintergrundgeräusche reduzieren
                    autoGainControl: true,   // Lautstärke automatisch anpassen
                    sampleRate: 48000,       // Höhere Audio-Qualität
                    channelCount: 2          // Stereo
                }
            });
            
            console.log('✅ Audio stream created:', {
                tracks: this.localStream.getTracks().length,
                audio: this.localStream.getAudioTracks().length
            });
            
            // Audio-Track Details loggen
            this.localStream.getAudioTracks().forEach((track, i) => {
                console.log(`Audio Track ${i}:`, {
                    enabled: track.enabled,
                    readyState: track.readyState,
                    settings: track.getSettings()
                });
                
                // Audio-Track Constraints optimieren
                track.applyConstraints({
                    autoGainControl: true,
                    echoCancellation: true,
                    noiseSuppression: true
                }).catch(e => console.log('Could not apply audio constraints:', e));
            });

            if (this.isInstructor) {
                // Debug: Peer Connections anzeigen
                console.log('🗺 Peer connections map:', Array.from(this.peerConnections.keys()));
                
                // Stream zu allen bestehenden Peer Connections hinzufügen
                console.log('📤 Adding stream to existing peer connections:', this.peerConnections.size);
                
                this.peerConnections.forEach((pc, sessionId) => {
                    console.log('📤 Adding stream to peer connection:', sessionId);
                    
                    this.localStream!.getTracks().forEach(track => {
                        console.log('📤 Adding track:', track.kind, 'to', sessionId);
                        pc.addTrack(track, this.localStream!);
                    });
                    
                    // Renegotiation starten
                    console.log('🔄 Creating new offer for renegotiation:', sessionId);
                    pc.createOffer()
                        .then(offer => pc.setLocalDescription(offer))
                        .then(() => {
                            console.log('📤 Sending renegotiation offer to:', sessionId);
                            this.sendMessage({
                                type: 'offer',
                                target: sessionId,
                                offer: pc.localDescription!
                            });
                        });
                });
                
                // Studenten über Stream-Verfügbarkeit informieren
                console.log('📡 Instructor notifying students about stream availability');
                this.sendMessage({
                    type: 'instructor-stream-start'
                });
            }
            
            return this.localStream;
        } catch (error) {
            console.error('❌ Error starting local stream:', error);
            throw error;
        }
    }

    // Bildschirmteilen starten
    async startScreenSharing(): Promise<MediaStream | null> {
        try {
            console.log('💻 Starting screen sharing...');
            
            // Bestehenden Screen-Stream stoppen falls vorhanden
            if (this.screenStream) {
                this.screenStream.getTracks().forEach(track => track.stop());
                this.screenStream = null;
            }
            
            // Bildschirm anfordern mit optimierten Einstellungen
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor',
                    width: { ideal: 1280 },  // Reduzierte Auflösung für bessere Kompatibilität
                    height: { ideal: 720 },
                    frameRate: { max: 30 }
                },
                audio: true  // Audio vom Bildschirm erlauben (falls verfügbar)
            });
            
            console.log('💻 Display stream obtained:', {
                tracks: displayStream.getTracks().length,
                video: displayStream.getVideoTracks().length,
                audio: displayStream.getAudioTracks().length
            });
            
            // Kombinierter Stream erstellen (Bildschirm + Audio)
            this.screenStream = displayStream;
            
            // Event-Handler für Beenden des Bildschirmteilens
            const videoTrack = displayStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.onended = () => {
                    console.log('❌ Screen sharing ended by user');
                    this.stopScreenSharing();
                };
                
                // Video-Track-Details loggen
                console.log('💻 Screen video track:', {
                    id: videoTrack.id,
                    label: videoTrack.label,
                    enabled: videoTrack.enabled,
                    readyState: videoTrack.readyState,
                    settings: videoTrack.getSettings()
                });
            }
            
            // Audio vom Mikrofon hinzufügen, falls kein Audio im Screen-Stream
            if (this.localStream && displayStream.getAudioTracks().length === 0) {
                console.log('🎤 Adding microphone audio to screen share');
                this.localStream.getAudioTracks().forEach(track => {
                    this.screenStream!.addTrack(track.clone());
                });
            }
            
            this.isScreenSharing = true;
            
            // Alle Peers über Bildschirmteilen informieren
            this.sendMessage({
                type: 'screen-share-start'
            });
            
            // Bildschirm zu allen Peers hinzufügen
            let successCount = 0;
            const peerCount = this.peerConnections.size;
            
            for (const [sessionId, pc] of this.peerConnections.entries()) {
                try {
                    console.log('💻 Adding screen to peer:', sessionId);
                    
                    // Bestehende Video-Sender entfernen
                    const senders = pc.getSenders();
                    const videoSenders = senders.filter(sender => 
                        sender.track && sender.track.kind === 'video'
                    );
                    
                    for (const sender of videoSenders) {
                        console.log('💻 Removing existing video track:', sender.track?.id);
                        pc.removeTrack(sender);
                    }
                    
                    // Pause für bessere Stabilität
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Alle Tracks vom Screen-Stream hinzufügen
                    this.screenStream!.getTracks().forEach(track => {
                        console.log(`💻 Adding ${track.kind} track to peer:`, sessionId);
                        pc.addTrack(track, this.screenStream!);
                    });
                    
                    // Neue Angebot erstellen und senden
                    await this.createAndSendOffer(sessionId);
                    successCount++;
                } catch (err) {
                    console.error(`❌ Error adding screen to peer ${sessionId}:`, err);
                }
            }
            
            console.log(`✅ Screen sharing added to ${successCount}/${peerCount} peers`);
            return this.screenStream;
            
        } catch (error) {
            console.error('❌ Error starting screen sharing:', error);
            this.isScreenSharing = false;
            return null;
        }
    }
    
    // Bildschirmteilen beenden
    async stopScreenSharing(): Promise<void> {
        if (this.screenStream) {
            console.log('💻 Stopping screen sharing...');
            
            // Alle Tracks stoppen
            this.screenStream.getTracks().forEach(track => {
                console.log(`💻 Stopping ${track.kind} track:`, track.id);
                track.stop();
            });
            
            // Alle Peers über Ende des Bildschirmteilens informieren
            this.sendMessage({
                type: 'screen-share-stop'
            });
            
            // Bildschirm-Stream freigeben
            this.screenStream = null;
            this.isScreenSharing = false;
            
            // Verbindungen neu aushandeln und nur Audio-Stream senden
            let successCount = 0;
            const peerCount = this.peerConnections.size;
            
            for (const [sessionId, pc] of this.peerConnections.entries()) {
                try {
                    console.log('💻 Resetting connection to audio-only for:', sessionId);
                    
                    // Alle Video-Tracks entfernen
                    const senders = pc.getSenders();
                    const videoSenders = senders.filter(sender => 
                        sender.track && sender.track.kind === 'video'
                    );
                    
                    for (const sender of videoSenders) {
                        console.log('💻 Removing video track:', sender.track?.id);
                        pc.removeTrack(sender);
                    }
                    
                    // Pause für bessere Stabilität
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Audio-Tracks neu hinzufügen falls vorhanden
                    if (this.localStream) {
                        const audioSenders = senders.filter(sender => 
                            sender.track && sender.track.kind === 'audio'
                        );
                        
                        // Wenn keine Audio-Sender vorhanden, Audio-Tracks hinzufügen
                        if (audioSenders.length === 0) {
                            this.localStream.getAudioTracks().forEach(track => {
                                console.log('🎤 Re-adding audio track to peer:', sessionId);
                                pc.addTrack(track, this.localStream!);
                            });
                        }
                    }
                    
                    // Neue Angebot erstellen und senden
                    await this.createAndSendOffer(sessionId);
                    successCount++;
                } catch (err) {
                    console.error(`❌ Error resetting peer ${sessionId}:`, err);
                }
            }
            
            console.log(`✅ Screen sharing stopped for ${successCount}/${peerCount} peers`);
        }
    }
    
    // Hilfsmethode für Angebotserstellung
    private async createAndSendOffer(sessionId: string): Promise<void> {
        const pc = this.peerConnections.get(sessionId);
        if (pc) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                
                this.sendMessage({
                    type: 'offer',
                    target: sessionId,
                    offer: offer
                });
            } catch (error) {
                console.error('❌ Error creating offer:', error);
            }
        }
    }

    private async handleMessage(data: WebRTCMessageType): Promise<void> {
        switch (data.type) {
            case 'user-joined': {
                const userJoinedData = data as UserJoinedMessage;
                console.log('👤 User joined:', userJoinedData.username, userJoinedData.role, 'sessionId:', userJoinedData.sessionId);
                console.log('🔍 Current role check: isInstructor =', this.isInstructor, 'userRole =', userJoinedData.role);
                this.onUserJoined?.(userJoinedData.username, userJoinedData.role);

                if (this.isInstructor && userJoinedData.role === 'STUDENT') {
                    // Dozent erstellt Verbindung zu neuem Studenten
                    console.log('🔗 Instructor creating peer connection to student:', userJoinedData.sessionId);
                    console.log('🗺 Peer connections before create:', this.peerConnections.size);
                    await this.createPeerConnection(userJoinedData.sessionId, true);
                    console.log('🗺 Peer connections after create:', this.peerConnections.size);
                } else {
                    console.log('⚠️ Not creating peer connection: isInstructor =', this.isInstructor, 'userRole =', userJoinedData.role);
                }
                break;
            }

            case 'instructor-stream-available': {
                const streamData = data as InstructorStreamAvailableMessage;
                console.log('📡 Instructor stream available, instructorSessionId:', streamData.instructorSessionId);
                if (!this.isInstructor) {
                    // Student erstellt Verbindung zum Dozenten
                    console.log('🔗 Student creating peer connection to instructor:', streamData.instructorSessionId);
                    await this.createPeerConnection(streamData.instructorSessionId, false);
                    this.onInstructorStreamAvailable?.();
                }
                break;
            }

            case 'offer':
                await this.handleOffer(data as OfferMessage);
                break;

            case 'answer':
                await this.handleAnswer(data as AnswerMessage);
                break;

            case 'ice-candidate':
                await this.handleIceCandidate(data as IceCandidateMessage);
                break;
                
            case 'screen-share-start':
                console.log('💻 Instructor started screen sharing');
                if (this.onScreenShareStart) {
                    this.onScreenShareStart();
                }
                break;
                
            case 'screen-share-stop':
                console.log('💻 Instructor stopped screen sharing');
                if (this.onScreenShareStop) {
                    this.onScreenShareStop();
                }
                break;
        }
    }

    private async createPeerConnection(sessionId: string, isInitiator: boolean): Promise<void> {
        console.log('🔗 Creating peer connection to:', sessionId, 'isInitiator:', isInitiator);
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require'
        });

        this.peerConnections.set(sessionId, pc);

        // Event-Handler für eingehende Streams
        pc.ontrack = (event) => {
            console.log('📺 Received remote stream from:', sessionId, 'streams:', event.streams.length);
            console.log('🔍 Event details:', event);
            if (event.streams && event.streams[0]) {
                console.log('✅ Remote stream tracks:', event.streams[0].getTracks().length);
                console.log('🔍 Remote stream details:', event.streams[0]);
                this.onRemoteStream?.(event.streams[0], sessionId);
            }
        };

        // Event-Handler für ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('🧊 Sending ICE candidate to:', sessionId);
                this.sendMessage({
                    type: 'ice-candidate',
                    target: sessionId,
                    candidate: event.candidate
                });
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('🧊 ICE connection state change:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'connected') {
                console.log('✅ ICE connected to:', sessionId);
            } else if (pc.iceConnectionState === 'failed') {
                console.error('❌ ICE connection failed with:', sessionId);
            } else if (pc.iceConnectionState === 'disconnected') {
                console.warn('⚠️ ICE disconnected from:', sessionId);
            } else if (pc.iceConnectionState === 'closed') {
                console.log('🧊 ICE connection closed with:', sessionId);
            } else if (pc.iceConnectionState === 'completed') {
                console.log('✅ ICE gathering complete for:', sessionId);
            }
        };

        // Wenn Initiator, dann Angebot erstellen
        if (isInitiator) {
            console.log('📤 Creating offer as initiator');
            
            // Wenn lokaler Stream vorhanden, zu Peer Connection hinzufügen
            if (this.localStream) {
                console.log('📤 Adding local stream to peer connection');
                this.localStream.getTracks().forEach(track => {
                    pc.addTrack(track, this.localStream!);
                });
            } else if (this.screenStream) {
                console.log('📤 Adding screen stream to peer connection');
                this.screenStream.getTracks().forEach(track => {
                    pc.addTrack(track, this.screenStream!);
                });
            }
            
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                
                console.log('📤 Sending offer to:', sessionId);
                this.sendMessage({
                    type: 'offer',
                    target: sessionId,
                    offer: offer
                });
            } catch (error) {
                console.error('❌ Error creating offer:', error);
            }
        }
    }

    private async handleOffer(data: OfferMessage): Promise<void> {
        console.log('📱 Received offer from:', data.target);
        
        let pc = this.peerConnections.get(data.target);
        
        // Wenn keine Peer Connection existiert, erstelle eine neue
        if (!pc) {
            console.log('🔗 Creating new peer connection for offer from:', data.target);
            await this.createPeerConnection(data.target, false);
            pc = this.peerConnections.get(data.target);
            
            if (!pc) {
                console.error('❌ Failed to create peer connection for:', data.target);
                return;
            }
        }
    
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            console.log('✅ Remote description set from offer');
            
            // Wenn lokaler Stream vorhanden, zu Peer Connection hinzufügen
            if (this.localStream) {
                console.log('� Adding local stream to peer connection before creating answer');
                this.localStream.getTracks().forEach(track => {
                    pc.addTrack(track, this.localStream!);
                });
            } else if (this.screenStream) {
                console.log('� Adding screen stream to peer connection before creating answer');
                this.screenStream.getTracks().forEach(track => {
                    pc.addTrack(track, this.screenStream!);
                });
            }
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            console.log('✅ Answer created and local description set');
            console.log('� Sending answer to:', data.target);
            
            this.sendMessage({
                type: 'answer',
                target: data.target,
                answer: answer
            });
        } catch (error) {
            console.error('❌ Error handling offer:', error);
        }
}

    private async handleAnswer(data: AnswerMessage): Promise<void> {
        console.log('📥 Received answer from:', data.target);
        
        const pc = this.peerConnections.get(data.target);
        if (!pc) {
            console.error('❌ No peer connection for:', data.target);
            return;
        }
        
        try {
            console.log('🔄 Setting remote description from answer');
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            console.log('✅ Remote description set from answer');
        } catch (error) {
            console.error('❌ Error handling answer:', error);
        }
    }

    private async handleIceCandidate(data: IceCandidateMessage): Promise<void> {
        console.log('🧊 Received ICE candidate from:', data.target);
        
        const pc = this.peerConnections.get(data.target);
        if (!pc) {
            console.error('❌ No peer connection for:', data.target);
            return;
        }
        
        try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log('✅ ICE candidate added successfully');
        } catch (error) {
            console.error('❌ Error adding ICE candidate:', error);
        }
    }
    
    // Helper-Methode zum Senden von Nachrichten
    private sendMessage(message: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            console.log('✅ Message sent successfully');
        } else {
            console.error('❌ WebSocket not connected');
        }
    }

    disconnect(): void {
        // Close all peer connections
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();

        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        // Close WebSocket
        if (this.ws) {
            this.ws.close();
        }
    }
}