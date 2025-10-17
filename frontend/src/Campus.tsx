import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Campus.css';

interface User {
    id: number;
    username: string;
    email: string;
}

function Campus() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [user, setUser] = useState<User | null>(null);

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
                    <h2 className="welcome-title">Willkommen zurück, {user.username}! 👋</h2>
                    <p className="welcome-subtitle">Bereit zum Lernen? Hier ist Ihr Dashboard.</p>
                </div>

                {/* Dashboard Grid */}
                <div className="dashboard-grid">
                    {/* Meine Kurse */}
                    <div className="dashboard-card">
                        <div className="card-icon">📚</div>
                        <h3 className="card-title">Meine Kurse</h3>
                        <p className="card-description">0 aktive Kurse</p>
                        <button className="card-button">Kurse durchsuchen</button>
                    </div>

                    {/* Fortschritt */}
                    <div className="dashboard-card">
                        <div className="card-icon">📊</div>
                        <h3 className="card-title">Lernfortschritt</h3>
                        <p className="card-description">0% abgeschlossen</p>
                        <button className="card-button">Details anzeigen</button>
                    </div>

                    {/* Zertifikate */}
                    <div className="dashboard-card">
                        <div className="card-icon">🏆</div>
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
                            <div className="course-image">🎨</div>
                            <div className="course-content">
                                <h4 className="course-title">Web Development Grundlagen</h4>
                                <p className="course-instructor">von Prof. Müller</p>
                                <div className="course-meta">
                                    <span className="course-duration">12 Wochen</span>
                                    <span className="course-level">Anfänger</span>
                                </div>
                                <button className="course-enroll">Einschreiben</button>
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
                                <button className="course-enroll">Einschreiben</button>
                            </div>
                        </div>

                        <div className="course-card">
                            <div className="course-image">🗄️</div>
                            <div className="course-content">
                                <h4 className="course-title">Datenbanken & SQL</h4>
                                <p className="course-instructor">von Prof. Weber</p>
                                <div className="course-meta">
                                    <span className="course-duration">8 Wochen</span>
                                    <span className="course-level">Mittelstufe</span>
                                </div>
                                <button className="course-enroll">Einschreiben</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Campus;