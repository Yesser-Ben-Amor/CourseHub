import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Backend API URL
const API_URL = 'http://localhost:8080/api/auth';

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
}

function App() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email ist erforderlich';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ungültige Email-Adresse';
    }

    // Username validation (only for registration)
    if (!isLogin) {
      if (!formData.username.trim()) {
        newErrors.username = 'Benutzername ist erforderlich';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Benutzername muss mindestens 3 Zeichen lang sein';
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        newErrors.username = 'Benutzername darf nur Buchstaben, Zahlen und Unterstriche enthalten';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }

    // Confirm password validation (only for registration)
    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwort bestätigen ist erforderlich';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    
    try {
      if (isLogin) {
        // Login - echter API Call
        const response = await axios.post(`${API_URL}/login`, {
          usernameOrEmail: formData.email,
          password: formData.password
        });
        
        console.log('Login erfolgreich:', response.data);
        
        // JWT Token im localStorage speichern
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.id,
          username: response.data.username,
          email: response.data.email
        }));
        
        setSuccessMessage(
          `Willkommen zurück, ${response.data.username}! Sie werden weitergeleitet...`
        );
        
        // Reset form
        setFormData({ email: '', username: '', password: '', confirmPassword: '' });
        
        // Redirect to Campus
        setTimeout(() => {
          navigate('/campus');
        }, 1500);
      } else {
        // Registrierung - echter API Call
        const response = await axios.post(`${API_URL}/register`, {
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        console.log('Registrierung erfolgreich:', response.data);
        
        setSuccessMessage(
          `Registrierung erfolgreich! Willkommen ${response.data.username}. Sie können sich jetzt anmelden.`
        );
        
        // Reset form after successful registration
        setFormData({ email: '', username: '', password: '', confirmPassword: '' });
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (error: any) {
      console.error('Error:', error);
      
      // Backend Error Handling
      if (error.response) {
        // Server hat mit Fehler geantwortet
        const errorData = error.response.data;
        
        if (errorData.error) {
          // Einzelner Fehler (z.B. "Email bereits registriert" oder "Ungültige Anmeldedaten")
          if (isLogin) {
            setErrors({ password: errorData.error });
          } else {
            setErrors({ email: errorData.error });
          }
        } else if (errorData.username || errorData.email || errorData.password || errorData.usernameOrEmail) {
          // Validierungsfehler von @Valid
          setErrors({
            username: errorData.username,
            email: errorData.email || errorData.usernameOrEmail,
            password: errorData.password
          });
        } else {
          setErrors({ email: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' });
        }
      } else if (error.request) {
        // Request wurde gesendet, aber keine Antwort erhalten
        setErrors({ email: 'Backend nicht erreichbar. Ist der Server gestartet?' });
      } else {
        // Anderer Fehler
        setErrors({ email: 'Ein unerwarteter Fehler ist aufgetreten.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', username: '', password: '', confirmPassword: '' });
    setErrors({});
    setSuccessMessage('');
  };

  const handleSocialLogin = (provider: 'github' | 'google' | 'linkedin') => {
    // OAuth2 Flow: Redirect zum Backend OAuth2 Endpoint
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  return (
    <div className="app-container">
      <div className="auth-wrapper">
        {/* Header */}
        <div className="auth-header">
          <h1 className="app-title">CourseHub</h1>
          <p className="app-subtitle">Ihre E-Learning Plattform</p>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          <div className="card-header">
            <h2 className="card-title">
              {isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
            </h2>
            <p className="card-subtitle">
              {isLogin 
                ? 'Melden Sie sich an, um fortzufahren' 
                : 'Registrieren Sie sich für ein neues Konto'
              }
            </p>
          </div>

          {successMessage && (
            <div className="alert alert-success">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="ihre.email@beispiel.de"
                disabled={loading}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Username Field (only for registration) */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="username" className="form-label">
                  Benutzername *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-input ${errors.username ? 'input-error' : ''}`}
                  placeholder="benutzername"
                  disabled={loading}
                />
                {errors.username && (
                  <span className="error-message">{errors.username}</span>
                )}
              </div>
            )}

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Passwort *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Confirm Password Field (only for registration) */}
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Passwort bestätigen *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword}</span>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Wird verarbeitet...' : (isLogin ? 'Anmelden' : 'Registrieren')}
            </button>
          </form>

          {/* Social Login - nur beim Login anzeigen */}
          {isLogin && (
            <>
              <div className="divider">
                <span className="divider-text">Oder anmelden mit</span>
              </div>

              <div className="social-buttons">
                <button 
                  type="button" 
                  className="social-button github"
                  onClick={() => handleSocialLogin('github')}
                  disabled={loading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </button>

                <button 
                  type="button" 
                  className="social-button google"
                  onClick={() => handleSocialLogin('google')}
                  disabled={loading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>

                {/* LinkedIn deaktiviert - Company Page erforderlich */}
                {/* <button 
                  type="button" 
                  className="social-button linkedin"
                  onClick={() => handleSocialLogin('linkedin')}
                  disabled={loading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button> */}
              </div>
            </>
          )}

          {/* Toggle Mode */}
          <div className="card-footer">
            <p className="toggle-text">
              {isLogin ? 'Noch kein Konto?' : 'Bereits registriert?'}
              {' '}
              <button 
                type="button" 
                onClick={toggleMode} 
                className="toggle-button"
                disabled={loading}
              >
                {isLogin ? 'Jetzt registrieren' : 'Jetzt anmelden'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
