import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

function AdminLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Hardcoded Admin Credentials
        if (username === 'ProfRoot' && password === 'courseHub#2025') {
            // Login erfolgreich
            localStorage.setItem('adminToken', 'admin-authenticated');
            localStorage.setItem('adminUser', username);
            navigate('/admin/dashboard');
        } else {
            setError('Ungültiger Benutzername oder Passwort');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-box">
                <div className="admin-login-header">
                    <h1 className="admin-login-title">CourseHub Admin</h1>
                    <p className="admin-login-subtitle">Administratorbereich</p>
                </div>

                <form onSubmit={handleSubmit} className="admin-login-form">
                    {error && (
                        <div className="admin-error-message">
                            {error}
                        </div>
                    )}

                    <div className="admin-form-group">
                        <label htmlFor="username" className="admin-label">Benutzername</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="admin-input"
                            placeholder="ProfRoot"
                            required
                        />
                    </div>

                    <div className="admin-form-group">
                        <label htmlFor="password" className="admin-label">Passwort</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="admin-input"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="admin-login-button">
                        Anmelden
                    </button>
                </form>

                <div className="admin-login-footer">
                    <a href="/" className="admin-back-link">← Zurück zur Startseite</a>
                </div>
            </div>
        </div>
    );
}

export default AdminLogin;