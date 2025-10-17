import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

function Campus() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState<User | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDetailView, setShowDetailView] = useState(false);
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

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
            setUser(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            navigate('/');
        }
    }, [navigate, searchParams]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleEnroll = (courseName: string) => {
        setSelectedCourse(courseName);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    const handleSelectPath = (path: string) => {
        // Für alle DevOps Lernpfade zeigen wir die Detail-Ansicht
        if (selectedCourse === 'DevOps' && (path === 'Anfänger' || path === 'Fortgeschrittene' || path === 'Profis')) {
            setSelectedPath(path);
            setShowModal(false);
            setShowDetailView(true);
        } else {
            console.log(`Eingeschrieben in: ${selectedCourse} - ${path}`);
            // Hier später API-Call zum Einschreiben
            handleCloseModal();
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
                        <a href="#" className="nav-link">Live Seminar</a>
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
                        <p className="card-description">0 aktive Kurse</p>
                        <button className="card-button">Kurse durchsuchen</button>
                    </div>

                    {/* Fortschritt */}
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <img src={lernIcon} alt="Lernfortschritt" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>
                        <h3 className="card-title">Lernfortschritt</h3>
                        <p className="card-description">0% abgeschlossen</p>
                        <button className="card-button">Details anzeigen</button>
                    </div>

                    {/* Zertifikate */}
                    <div className="dashboard-card">
                        <div className="card-icon">
                            <img src={kroneIcon} alt="Zertifikate" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                        </div>
                        <h3 className="card-title">Zertifikate</h3>
                        <p className="card-description">0 Zertifikate erworben</p>
                        <button className="card-button">Alle anzeigen</button>
                    </div>

                    {/* Aktivitäten */}
                    <div className="dashboard-card">
                        <div className="card-icon">📅</div>
                        <h3 className="card-title">Letzte Aktivitäten</h3>
                        <p className="card-description">Keine Aktivitäten</p>
                        <button className="card-button">Verlauf anzeigen</button>
                    </div>
                </div>

                {/* Empfohlene Kurse */}
                <section className="recommended-section">
                    <h3 className="section-title">Empfohlene Kurse</h3>
                    <div className="courses-grid">
                        <div className="course-card">
                            <div className="course-image">
                                <img src={devopsIcon} alt="DevOps" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                            </div>
                            <div className="course-content">
                                <h4 className="course-title">DevOps</h4>
                                <p className="course-instructor">von Prof. Müller</p>
                                <div className="course-meta">
                                    <span className="course-duration">12 Wochen</span>
                                    <span className="course-level">Fortgeschritten</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('DevOps')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">
                                <img src={cyberIcon} alt="Cybersecurity" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                            </div>
                            <div className="course-content">
                                <h4 className="course-title">Cybersecurity</h4>
                                <p className="course-instructor">von Dr. Schmidt</p>
                                <div className="course-meta">
                                    <span className="course-duration">10 Wochen</span>
                                    <span className="course-level">Fortgeschritten</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Cybersecurity')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">☁️</div>
                            <div className="course-content">
                                <h4 className="course-title">Cloud Computing</h4>
                                <p className="course-instructor">von Prof. Weber</p>
                                <div className="course-meta">
                                    <span className="course-duration">8 Wochen</span>
                                    <span className="course-level">Mittelstufe</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Cloud Computing')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">
                                <img src={bsIcon} alt="Betriebssysteme" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                            </div>
                            <div className="course-content">
                                <h4 className="course-title">Betriebssysteme</h4>
                                <p className="course-instructor">von Dr. Fischer</p>
                                <div className="course-meta">
                                    <span className="course-duration">10 Wochen</span>
                                    <span className="course-level">Mittelstufe</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Betriebssysteme')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">
                                <img src={networkIcon} alt="Netzwerk" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                            </div>
                            <div className="course-content">
                                <h4 className="course-title">Netzwerk</h4>
                                <p className="course-instructor">von Prof. Becker</p>
                                <div className="course-meta">
                                    <span className="course-duration">9 Wochen</span>
                                    <span className="course-level">Mittelstufe</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Netzwerk')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">⚙️</div>
                            <div className="course-content">
                                <h4 className="course-title">Softwareengineering</h4>
                                <p className="course-instructor">von Dr. Hoffmann</p>
                                <div className="course-meta">
                                    <span className="course-duration">12 Wochen</span>
                                    <span className="course-level">Fortgeschritten</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Softwareengineering')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">🧩</div>
                            <div className="course-content">
                                <h4 className="course-title">Algorithmus</h4>
                                <p className="course-instructor">von Prof. Klein</p>
                                <div className="course-meta">
                                    <span className="course-duration">10 Wochen</span>
                                    <span className="course-level">Fortgeschritten</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Algorithmus')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">💡</div>
                            <div className="course-content">
                                <h4 className="course-title">Problemsolving</h4>
                                <p className="course-instructor">von Dr. Wagner</p>
                                <div className="course-meta">
                                    <span className="course-duration">8 Wochen</span>
                                    <span className="course-level">Alle Stufen</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Problemsolving')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">🖥️</div>
                            <div className="course-content">
                                <h4 className="course-title">Server & Systemadministration</h4>
                                <p className="course-instructor">von Prof. Schneider</p>
                                <div className="course-meta">
                                    <span className="course-duration">11 Wochen</span>
                                    <span className="course-level">Fortgeschritten</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Server & Systemadministration')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">
                                <img src={webIcon} alt="Web Development" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                            </div>
                            <div className="course-content">
                                <h4 className="course-title">Web Development Grundlagen</h4>
                                <p className="course-instructor">von Prof. Müller</p>
                                <div className="course-meta">
                                    <span className="course-duration">12 Wochen</span>
                                    <span className="course-level">Anfänger</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Web Development')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">💻</div>
                            <div className="course-content">
                                <h4 className="course-title">Java Programmierung</h4>
                                <p className="course-instructor">von Dr. Schmidt</p>
                                <div className="course-meta">
                                    <span className="course-duration">10 Wochen</span>
                                    <span className="course-level">Fortgeschritten</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Java Programmierung')}>Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">
                                <img src={dbIcon} alt="Datenbanken & SQL" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                            </div>
                            <div className="course-content">
                                <h4 className="course-title">Datenbanken & SQL</h4>
                                <p className="course-instructor">von Prof. Weber</p>
                                <div className="course-meta">
                                    <span className="course-duration">8 Wochen</span>
                                    <span className="course-level">Mittelstufe</span>
                                </div>
                                <button className="course-enroll" onClick={() => handleEnroll('Datenbanken & SQL')}>Einschreiben</button>
                            </div>
                        </div>
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
                            <button className="detail-button-primary">Jetzt einschreiben</button>
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
                            <button className="detail-button-primary">Jetzt einschreiben</button>
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
                            <button className="detail-button-primary">Jetzt einschreiben</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Campus;