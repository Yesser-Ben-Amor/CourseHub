import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Campus.css';
import devopsIcon from './assets/devops-icon.png';
import cyberIcon from './assets/cyber.webp';
import bsIcon from './assets/bs.webp';
import networkIcon from './assets/network.webp';
import kurseIcon from './assets/kurse.webp';
import lernIcon from './assets/lern.webp';
import kroneIcon from './assets/krone.webp';
import webIcon from './assets/web.webp';
import dbIcon from './assets/db.webp';

interface User {
    id: number;
    username: string;
    email: string;
}

interface LearningPath {
    id: number;
    level: string;
    description: string;
    maxPoints: number;
}

interface Course {
    id: number;
    name: string;
    description: string;
    learningPaths?: LearningPath[];
}

interface DashboardStats {
    totalEnrollments: number;
    averageProgress: number;
    completedCourses: number;
    lastActivity: string | null;
}

function Campus() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [selectedCourseData, setSelectedCourseData] = useState<Course | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailView, setShowDetailView] = useState(false);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [enrolling, setEnrolling] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        totalEnrollments: 0,
        averageProgress: 0,
        completedCourses: 0,
        lastActivity: null
    });

    useEffect(() => {
        // Prüfe ob Token in URL Query Parameters (OAuth2 Redirect)
        const urlToken = searchParams.get('token');
        const urlUsername = searchParams.get('username');
        const urlEmail = searchParams.get('email');
        const urlId = searchParams.get('id');

        if (urlToken && urlUsername && urlEmail && urlId) {
            // OAuth2 Login: Speichere Token und User-Daten
            localStorage.setItem('token', urlToken);
            localStorage.setItem('user', JSON.stringify({
                id: parseInt(urlId),
                username: urlUsername,
                email: urlEmail
            }));
            
            // Entferne Query Parameters aus URL
            navigate('/campus', { replace: true });
            return;
        }

        // User aus localStorage laden
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
            // Nicht eingeloggt -> zurück zum Login
            navigate('/');
            return;
        }

        try {
            const userData = JSON.parse(userStr);
            
            // Role-Erkennung basierend auf Email
            if (!userData.role) {
                const isInstructor = userData.email && (
                    userData.email.toLowerCase() === 'teacher@coursehub.de' ||
                    userData.email.toLowerCase().endsWith('@coursehub.de') ||
                    userData.email.toLowerCase().includes('teacher') ||
                    userData.email.toLowerCase().includes('dozent')
                );
                userData.role = isInstructor ? 'INSTRUCTOR' : 'STUDENT';
            }
            
            // Debug: Zeige User-Daten in Console
            console.log('User Data:', {
                username: userData.username,
                email: userData.email,
                role: userData.role,
                isInstructor: userData.role === 'INSTRUCTOR'
            });
            
            setUser(userData);
            
            // Lade Kurse vom Backend
            loadCourses();
            loadStats(userData.id);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/');
        }
    }, [navigate, searchParams]);

    const loadCourses = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/courses');
            setCourses(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Kurse:', error);
        }
    };

    const loadStats = async (userId?: number) => {
        const id = userId || user?.id;
        if (!id) {
            console.log('loadStats: Kein User vorhanden');
            return;
        }
        console.log('loadStats: Lade Stats für User', id);
        try {
            const response = await axios.get(`http://localhost:8080/api/enrollments/user/${id}/stats`);
            console.log('loadStats: Erhaltene Stats:', response.data);
            setStats(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Statistiken:', error);
        }
    };

    const getCourseIcon = (courseName: string) => {
        const name = courseName.toLowerCase();
        if (name.includes('devops')) return devopsIcon;
        if (name.includes('cyber')) return cyberIcon;
        if (name.includes('betriebssystem') || name.includes('os')) return bsIcon;
        if (name.includes('netzwerk') || name.includes('network')) return networkIcon;
        if (name.includes('web')) return webIcon;
        if (name.includes('datenbank') || name.includes('database') || name.includes('sql')) return dbIcon;
        if (name.includes('kurs')) return kurseIcon;
        // Default Icon
        return devopsIcon;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleEnroll = (course: Course) => {
        console.log('handleEnroll aufgerufen mit Kurs:', course);
        console.log('LearningPaths:', course.learningPaths);
        setSelectedCourse(course.name);
        setSelectedCourseId(course.id);
        setSelectedCourseData(course);
        setShowModal(true);
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const enrollInCourse = async (learningPathId: number, closeModal: boolean = false) => {
        if (!user || !selectedCourseId) return;
        
        setEnrolling(true);
        try {
            await axios.post('http://localhost:8080/api/enrollments', {
                userId: user.id,
                courseId: selectedCourseId,
                learningPathId: learningPathId
            });
            
            showToast('Erfolgreich eingeschrieben! Sie finden den Kurs unter "Meine Kurse".', 'success');
            loadStats(user?.id); // Aktualisiere Dashboard-Stats
            
            if (closeModal) {
                // Warte kurz, damit User die Meldung sieht
                setTimeout(() => {
                    handleCloseModal();
                    setShowDetailView(false);
                }, 1500);
            }
        } catch (error: any) {
            console.error('Fehler beim Einschreiben:', error);
            const errorMsg = error.response?.data?.message || 'Fehler beim Einschreiben';
            showToast(errorMsg, 'error');
        } finally {
            setEnrolling(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    const handleSelectPath = async (path: string) => {
        console.log('handleSelectPath aufgerufen mit:', path);
        console.log('selectedCourse:', selectedCourse);
        console.log('selectedCourseData:', selectedCourseData);
        
        // Für DevOps Lernpfade zeigen wir die Detail-Ansicht
        if (selectedCourse === 'DevOps' && (path === 'Anfänger' || path === 'Fortgeschrittene' || path === 'Profis')) {
            setSelectedPath(path);
            setShowModal(false);
            setShowDetailView(true);
        } else {
            // Für andere Kurse: Finde die echte LearningPath-ID aus dem Kurs
            if (!selectedCourseData?.learningPaths) {
                console.error('Keine LearningPaths gefunden!');
                showToast('Keine Lernpfade verfügbar', 'error');
                return;
            }
            
            console.log('Suche nach LearningPath mit level:', path);
            console.log('Verfügbare LearningPaths:', selectedCourseData.learningPaths);
            
            const learningPath = selectedCourseData.learningPaths.find(lp => lp.level === path);
            console.log('Gefundener LearningPath:', learningPath);
            
            if (!learningPath) {
                showToast(`Lernpfad "${path}" nicht gefunden`, 'error');
                return;
            }
            
            console.log('Enrolle in LearningPath ID:', learningPath.id);
            await enrollInCourse(learningPath.id);
        }
    };

    const handleCloseDetailView = () => {
        setShowDetailView(false);
        setSelectedCourse(null);
        setSelectedPath(null);
    };

    if (!user) {
        return <div className="loading">Laden...</div>;
    }

    return (
        <div className="campus-container">
            {/* Header */}
            <header className="campus-header">
                <div className="header-content">
                    <h1 className="campus-logo">CourseHub</h1>
                    <nav className="campus-nav">
                        <a href="#" className="nav-link active">Campus</a>
                        {/* Live Seminar - nur für Dozenten */}
                        {user.role === 'INSTRUCTOR' && (
                            <button 
                                onClick={() => {
                                    // Verwende ersten verfügbaren Kurs oder erstelle Demo-Seminar
                                    const firstCourse = courses.length > 0 ? courses[0].id : 1;
                                    navigate(`/live-seminar/${firstCourse}`);
                                }} 
                                className="nav-link nav-button"
                            >
                                🎓 Live Seminar
                            </button>
                        )}
                        <a href="#" className="nav-link">Bibliothek</a>
                        <a href="#" className="nav-link">Meine Kurse</a>
                        <a href="#" className="nav-link">Kalender</a>
                        <a href="#" className="nav-link">Nachrichten</a>
                    </nav>
                    <div className="header-user">
                        <div className="user-info">
                            <span className="user-name">{user.username}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                        <button onClick={handleLogout} className="logout-button">
                            Abmelden
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="campus-main">
                <div className="welcome-section">
                    <h2 className="welcome-title">Willkommen zurück, {user.username}!</h2>
                    <p className="welcome-subtitle">Bereit zum Lernen? Hier ist Ihr Dashboard.</p>
                </div>

                {/* Dashboard Grid */}
                <div className="dashboard-grid">
                    {/* Meine Kurse */}
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <img src={kurseIcon} alt="Meine Kurse" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>
                        <h3 className="card-title">Meine Kurse</h3>
                        <p className="card-description">{stats.totalEnrollments} aktive Kurse</p>
                        <button className="card-button">Kurse durchsuchen</button>
                    </div>

                    {/* Fortschritt */}
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <img src={lernIcon} alt="Lernfortschritt" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>
                        <h3 className="card-title">Lernfortschritt</h3>
                        <p className="card-description">{Math.round(stats.averageProgress)}% abgeschlossen</p>
                        <button className="card-button">Details anzeigen</button>
                    </div>

                    {/* Zertifikate */}
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <img src={kroneIcon} alt="Zertifikate" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>
                        <h3 className="card-title">Zertifikate</h3>
                        <p className="card-description">{stats.completedCourses} Zertifikate erworben</p>
                        <button className="card-button">Alle anzeigen</button>
                    </div>

                    {/* Aktivitäten */}
                    <div className="dashboard-card">
                        <div className="card-icon">📅</div>
                        <h3 className="card-title">Letzte Aktivitäten</h3>
                        <p className="card-description">
                            {stats.lastActivity 
                                ? new Date(stats.lastActivity).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
                                : 'Keine Aktivitäten'
                            }
                        </p>
                        <button className="card-button">Verlauf anzeigen</button>
                    </div>
                </div>

                {/* Empfohlene Kurse */}
                <section className="recommended-section">
                    <h3 className="section-title">Verfügbare Kurse</h3>
                    <div className="courses-grid">
                        {courses.length === 0 ? (
                            <p>Keine Kurse verfügbar</p>
                        ) : (
                            courses.map(course => (
                                <div key={course.id} className="course-card">
                                    <div className="course-image">
                                        <img src={getCourseIcon(course.name)} alt={course.name} style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                                    </div>
                                    <div className="course-content">
                                        <h4 className="course-title">{course.name}</h4>
                                        <p className="course-instructor">{course.description}</p>
                                        <div className="course-meta">
                                            <span className="course-duration">{course.learningPaths?.length || 0} Lernpfade</span>
                                        </div>
                                        <div className="course-actions">
                                            <button className="course-enroll" onClick={() => handleEnroll(course)}>Einschreiben</button>
                                            
                                            {/* Live beitreten - nur für Studenten */}
                                            {user.role === 'STUDENT' && (
                                                <button 
                                                    onClick={() => navigate(`/live-seminar/${course.id}`)}
                                                    className="join-live-btn"
                                                    title="Live-Seminar beitreten (falls aktiv)"
                                                >
                                                    🔴 Live
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            {/* Modal für Lernpfade */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseModal}>&times;</button>
                        <h2 className="modal-title">{selectedCourse} - Lernpfad wählen</h2>
                        <p className="modal-subtitle">Wählen Sie den passenden Lernpfad für Ihr Niveau</p>
                        
                        <div className="certificate-info">
                            <p className="certificate-requirement">
                                <strong>Zertifikat-Anforderung:</strong> Mindestens 500 Punkte erforderlich (Maximum: 600 Punkte)
                            </p>
                        </div>

                        <div className="learning-paths">
                            <div className="path-card">
                                <div className="path-points">100 Punkte</div>
                                <h3 className="path-title">Lernpfad für Anfänger</h3>
                                <p className="path-description">Grundlagen und erste Schritte</p>
                                <ul className="path-features">
                                    <li>Einführung in {selectedCourse}</li>
                                    <li>Grundlegende Konzepte</li>
                                    <li>Praktische Übungen</li>
                                    <li>Basis-Level Inhalte</li>
                                </ul>
                                <button className="path-button" onClick={() => handleSelectPath('Anfänger')}>Auswählen</button>
                            </div>

                            <div className="path-card path-card-featured">
                                <div className="path-badge">Beliebt</div>
                                <div className="path-points">200 Punkte</div>
                                <h3 className="path-title">Lernpfad für Fortgeschrittene</h3>
                                <p className="path-description">Erweiterte Kenntnisse und Praxis</p>
                                <ul className="path-features">
                                    <li>Fortgeschrittene Techniken</li>
                                    <li>Real-World Projekte</li>
                                    <li>Best Practices</li>
                                    <li>Intermediate-Level Inhalte</li>
                                </ul>
                                <button className="path-button" onClick={() => handleSelectPath('Fortgeschrittene')}>Auswählen</button>
                            </div>

                            <div className="path-card">
                                <div className="path-points">300 Punkte</div>
                                <h3 className="path-title">Lernpfad für Profis</h3>
                                <p className="path-description">Expertenwissen und Spezialisierung</p>
                                <ul className="path-features">
                                    <li>Experten-Level Inhalte</li>
                                    <li>Komplexe Szenarien</li>
                                    <li>Spezialisierungen</li>
                                    <li>Advanced-Level Inhalte</li>
                                </ul>
                                <button className="path-button" onClick={() => handleSelectPath('Profis')}>Auswählen</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detaillierte Lernpfad-Ansicht - Anfänger */}
            {showDetailView && selectedCourse === 'DevOps' && selectedPath === 'Anfänger' && (
                <div className="modal-overlay" onClick={handleCloseDetailView}>
                    <div className="detail-view-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseDetailView}>&times;</button>
                        
                        <div className="detail-header">
                            <h2 className="detail-title">DevOps - Lernpfad für Anfänger</h2>
                            <div className="detail-meta">
                                <span className="detail-points">100 Punkte</span>
                                <span className="detail-duration">12 Wochen</span>
                                <span className="detail-level">Anfänger</span>
                            </div>
                        </div>

                        <div className="detail-body">
                            <section className="detail-section">
                                <h3 className="section-heading">Überblick</h3>
                                <p className="section-text">
                                    Dieser Lernpfad führt Sie in die Grundlagen von DevOps ein. Sie lernen die wichtigsten 
                                    Konzepte, Tools und Praktiken kennen, die in modernen Softwareentwicklungsteams eingesetzt werden.
                                </p>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Lernziele</h3>
                                <ul className="learning-objectives">
                                    <li>Verständnis der DevOps-Philosophie und -Kultur</li>
                                    <li>Grundlagen von Continuous Integration/Continuous Deployment (CI/CD)</li>
                                    <li>Einführung in Versionskontrolle mit Git</li>
                                    <li>Basis-Kenntnisse in Docker und Containerisierung</li>
                                    <li>Grundlegende Automatisierung mit Scripts</li>
                                </ul>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Kursinhalt</h3>
                                <div className="course-modules">
                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 1</span>
                                            <span className="module-title">Einführung in DevOps</span>
                                            <span className="module-duration">2 Wochen</span>
                                        </div>
                                        <p className="module-description">Was ist DevOps? Kultur, Prinzipien und Best Practices</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 2</span>
                                            <span className="module-title">Git & Versionskontrolle</span>
                                            <span className="module-duration">3 Wochen</span>
                                        </div>
                                        <p className="module-description">Git Basics, Branching, Merging und Collaboration</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 3</span>
                                            <span className="module-title">CI/CD Grundlagen</span>
                                            <span className="module-duration">3 Wochen</span>
                                        </div>
                                        <p className="module-description">Continuous Integration und Deployment Pipelines</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 4</span>
                                            <span className="module-title">Docker Basics</span>
                                            <span className="module-duration">3 Wochen</span>
                                        </div>
                                        <p className="module-description">Container, Images und Docker Compose</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 5</span>
                                            <span className="module-title">Abschlussprojekt</span>
                                            <span className="module-duration">1 Woche</span>
                                        </div>
                                        <p className="module-description">Praktisches Projekt zur Anwendung des Gelernten</p>
                                    </div>
                                </div>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Voraussetzungen</h3>
                                <ul className="prerequisites">
                                    <li>Grundlegende Programmierkenntnisse</li>
                                    <li>Vertrautheit mit der Kommandozeile</li>
                                    <li>Keine Vorkenntnisse in DevOps erforderlich</li>
                                </ul>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Zertifikat</h3>
                                <p className="section-text">
                                    Nach erfolgreichem Abschluss erhalten Sie 100 Punkte. Für das vollständige DevOps-Zertifikat 
                                    benötigen Sie mindestens 500 Punkte aus allen Lernpfaden.
                                </p>
                            </section>
                        </div>

                        <div className="detail-footer">
                            <button className="detail-button-secondary" onClick={handleCloseDetailView}>Zurück</button>
                            <div className="course-actions">
                                <button 
                                    onClick={() => enrollInCourse(1, true)}
                                    disabled={enrolling}
                                    className="enroll-btn"
                                >
                                    {enrolling ? 'Wird eingeschrieben...' : 'Einschreiben'}
                                </button>
                                {user.role === 'STUDENT' && (
                                    <button 
                                        onClick={() => navigate(`/live-seminar/${course.id}`)}
                                        className="join-live-btn"
                                        title="Live-Seminar beitreten (falls aktiv)"
                                    >
                                        🔴 Live beitreten
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detaillierte Lernpfad-Ansicht - Fortgeschrittene */}
            {showDetailView && selectedCourse === 'DevOps' && selectedPath === 'Fortgeschrittene' && (
                <div className="modal-overlay" onClick={handleCloseDetailView}>
                    <div className="detail-view-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseDetailView}>&times;</button>
                        
                        <div className="detail-header">
                            <h2 className="detail-title">DevOps - Lernpfad für Fortgeschrittene</h2>
                            <div className="detail-meta">
                                <span className="detail-points">200 Punkte</span>
                                <span className="detail-duration">12 Wochen</span>
                                <span className="detail-level">Fortgeschrittene</span>
                            </div>
                        </div>

                        <div className="detail-body">
                            <section className="detail-section">
                                <h3 className="section-heading">Überblick</h3>
                                <p className="section-text">
                                    Dieser Lernpfad richtet sich an erfahrene Entwickler, die ihre DevOps-Kenntnisse vertiefen möchten. 
                                    Sie lernen fortgeschrittene Techniken, Best Practices und arbeiten an realen Projekten.
                                </p>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Lernziele</h3>
                                <ul className="learning-objectives">
                                    <li>Fortgeschrittene CI/CD Pipeline-Architekturen</li>
                                    <li>Infrastructure as Code mit Terraform und Ansible</li>
                                    <li>Kubernetes und Container-Orchestrierung</li>
                                    <li>Monitoring, Logging und Observability</li>
                                    <li>Security Best Practices in DevOps (DevSecOps)</li>
                                </ul>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Kursinhalt</h3>
                                <div className="course-modules">
                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 1</span>
                                            <span className="module-title">Advanced CI/CD</span>
                                            <span className="module-duration">2 Wochen</span>
                                        </div>
                                        <p className="module-description">Multi-Stage Pipelines, Blue-Green Deployments, Canary Releases</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 2</span>
                                            <span className="module-title">Infrastructure as Code</span>
                                            <span className="module-duration">3 Wochen</span>
                                        </div>
                                        <p className="module-description">Terraform, Ansible, CloudFormation - Infrastruktur automatisieren</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 3</span>
                                            <span className="module-title">Kubernetes Deep Dive</span>
                                            <span className="module-duration">3 Wochen</span>
                                        </div>
                                        <p className="module-description">Pods, Services, Deployments, StatefulSets, Helm Charts</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 4</span>
                                            <span className="module-title">Monitoring & Observability</span>
                                            <span className="module-duration">2 Wochen</span>
                                        </div>
                                        <p className="module-description">Prometheus, Grafana, ELK Stack, Distributed Tracing</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 5</span>
                                            <span className="module-title">DevSecOps</span>
                                            <span className="module-duration">2 Wochen</span>
                                        </div>
                                        <p className="module-description">Security Scanning, Secrets Management, Compliance Automation</p>
                                    </div>
                                </div>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Voraussetzungen</h3>
                                <ul className="prerequisites">
                                    <li>Abschluss des Anfänger-Lernpfads oder gleichwertige Kenntnisse</li>
                                    <li>Erfahrung mit Git und CI/CD</li>
                                    <li>Grundkenntnisse in Docker und Containerisierung</li>
                                    <li>Vertrautheit mit Cloud-Plattformen (AWS, Azure oder GCP)</li>
                                </ul>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Zertifikat</h3>
                                <p className="section-text">
                                    Nach erfolgreichem Abschluss erhalten Sie 200 Punkte. Für das vollständige DevOps-Zertifikat 
                                    benötigen Sie mindestens 500 Punkte aus allen Lernpfaden.
                                </p>
                            </section>
                        </div>

                        <div className="detail-footer">
                            <button className="detail-button-secondary" onClick={handleCloseDetailView}>Zurück</button>
                            <button 
                                className="detail-button-primary"
                                onClick={() => enrollInCourse(2, true)}
                                disabled={enrolling}
                            >
                                {enrolling ? 'Wird eingeschrieben...' : 'Jetzt einschreiben'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detaillierte Lernpfad-Ansicht - Profis */}
            {showDetailView && selectedCourse === 'DevOps' && selectedPath === 'Profis' && (
                <div className="modal-overlay" onClick={handleCloseDetailView}>
                    <div className="detail-view-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={handleCloseDetailView}>&times;</button>
                        
                        <div className="detail-header">
                            <h2 className="detail-title">DevOps - Lernpfad für Profis</h2>
                            <div className="detail-meta">
                                <span className="detail-points">300 Punkte</span>
                                <span className="detail-duration">12 Wochen</span>
                                <span className="detail-level">Profis</span>
                            </div>
                        </div>

                        <div className="detail-body">
                            <section className="detail-section">
                                <h3 className="section-heading">Überblick</h3>
                                <p className="section-text">
                                    Dieser Lernpfad richtet sich an DevOps-Experten, die ihre Fähigkeiten auf das höchste Niveau bringen möchten. 
                                    Sie arbeiten an komplexen Enterprise-Szenarien und lernen Spezialisierungen kennen.
                                </p>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Lernziele</h3>
                                <ul className="learning-objectives">
                                    <li>Multi-Cloud und Hybrid-Cloud Strategien</li>
                                    <li>Service Mesh und Microservices-Architekturen</li>
                                    <li>GitOps und Advanced Deployment Strategies</li>
                                    <li>Chaos Engineering und Resilience Testing</li>
                                    <li>DevOps Leadership und Team-Transformation</li>
                                </ul>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Kursinhalt</h3>
                                <div className="course-modules">
                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 1</span>
                                            <span className="module-title">Multi-Cloud Architecture</span>
                                            <span className="module-duration">3 Wochen</span>
                                        </div>
                                        <p className="module-description">AWS, Azure, GCP - Cloud-agnostische Lösungen entwickeln</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 2</span>
                                            <span className="module-title">Service Mesh & Microservices</span>
                                            <span className="module-duration">3 Wochen</span>
                                        </div>
                                        <p className="module-description">Istio, Linkerd, Service Discovery, Circuit Breakers</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 3</span>
                                            <span className="module-title">GitOps & Advanced Deployments</span>
                                            <span className="module-duration">2 Wochen</span>
                                        </div>
                                        <p className="module-description">ArgoCD, Flux, Progressive Delivery, Feature Flags</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 4</span>
                                            <span className="module-title">Chaos Engineering</span>
                                            <span className="module-duration">2 Wochen</span>
                                        </div>
                                        <p className="module-description">Resilience Testing, Fault Injection, Disaster Recovery</p>
                                    </div>

                                    <div className="module-item">
                                        <div className="module-header">
                                            <span className="module-number">Modul 5</span>
                                            <span className="module-title">DevOps Leadership</span>
                                            <span className="module-duration">2 Wochen</span>
                                        </div>
                                        <p className="module-description">Team-Transformation, Culture Change, Best Practices</p>
                                    </div>
                                </div>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Voraussetzungen</h3>
                                <ul className="prerequisites">
                                    <li>Abschluss des Fortgeschrittenen-Lernpfads oder gleichwertige Kenntnisse</li>
                                    <li>Mehrjährige Erfahrung in DevOps-Umgebungen</li>
                                    <li>Tiefgehende Kenntnisse in Kubernetes und Cloud-Plattformen</li>
                                    <li>Erfahrung mit komplexen Produktions-Deployments</li>
                                </ul>
                            </section>

                            <section className="detail-section">
                                <h3 className="section-heading">Zertifikat</h3>
                                <p className="section-text">
                                    Nach erfolgreichem Abschluss erhalten Sie 300 Punkte. Mit diesem Lernpfad erreichen Sie die 
                                    maximale Punktzahl von 600 Punkten und erhalten das vollständige DevOps Professional Zertifikat.
                                </p>
                            </section>
                        </div>

                        <div className="detail-footer">
                            <button className="detail-button-secondary" onClick={handleCloseDetailView}>Zurück</button>
                            <button 
                                className="detail-button-primary"
                                onClick={() => enrollInCourse(3, true)}
                                disabled={enrolling}
                            >
                                {enrolling ? 'Wird eingeschrieben...' : 'Jetzt einschreiben'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Benachrichtigung */}
            {toast && (
                <div className={`toast toast-${toast.type}`} style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '1rem 1.5rem',
                    borderRadius: '6px',
                    background: toast.type === 'success' ? '#238636' : '#da3633',
                    color: '#ffffff',
                    fontWeight: '500',
                    zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    {toast.message}
                </div>
            )}

            {/* Toast Benachrichtigung */}
            {toast && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    padding: '1rem 1.5rem',
                    borderRadius: '6px',
                    background: toast.type === 'success' ? '#238636' : '#da3633',
                    color: '#ffffff',
                    fontWeight: '500',
                    zIndex: 9999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                }}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}

export default Campus;