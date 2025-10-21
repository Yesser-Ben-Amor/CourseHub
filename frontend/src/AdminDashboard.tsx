import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import devopsIcon from './assets/devops-icon.png';
import kurseIcon from './assets/kurse.webp';
import lernIcon from './assets/lern.webp';
import kroneIcon from './assets/krone.webp';

interface Student {
    id: number;
    username: string;
    email: string;
    createdAt: string;
}

interface Teacher {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    qualifications: string;
    subject: string;
    createdAt: string;
}

interface Statistics {
    totalStudents: number;
    totalTeachers: number;
    totalEnrollments: number;
    totalCertificates: number;
    totalCourses: number;
}

interface Course {
    id: number;
    name: string;
    description: string;
    learningPaths?: any[];
}

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('overview');
    const [adminUser, setAdminUser] = useState('');
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [statistics, setStatistics] = useState<Statistics>({
        totalStudents: 0,
        totalTeachers: 0,
        totalEnrollments: 0,
        totalCertificates: 0,
        totalCourses: 0
    });
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showTeacherModal, setShowTeacherModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [teacherFormData, setTeacherFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        birthPlace: '',
        qualifications: '',
        subject: ''
    });
    const [teacherView, setTeacherView] = useState<'list' | 'create'>('list');
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{message: string, onConfirm: () => void} | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [courseFormData, setCourseFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        // Prüfe ob Admin eingeloggt ist
        const adminToken = localStorage.getItem('adminToken');
        const adminUsername = localStorage.getItem('adminUser');

        if (!adminToken) {
            navigate('/admin');
            return;
        }

        setAdminUser(adminUsername || 'Admin');
        
        // Lade Statistics für Overview
        if (activeView === 'overview') {
            loadStatistics();
        }
        
        // Lade Studenten wenn View aktiv ist
        if (activeView === 'students') {
            loadStudents();
        }
        
        // Lade Dozenten wenn View aktiv ist
        if (activeView === 'teachers') {
            loadTeachers();
        }
        
        // Lade Kurse wenn View aktiv ist
        if (activeView === 'courses') {
            loadCourses();
        }
    }, [navigate, activeView]);

    useEffect(() => {
        if (activeView !== 'students' && showModal) {
            setEditingStudent(null);
            setShowModal(false);
            setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        }
    }, [activeView, showModal]);

    const loadStatistics = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/admin/statistics');
            setStatistics(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Statistiken:', error);
        }
    };

    const loadStudents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/users');
            setStudents(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Studenten:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStudent = () => {
        setEditingStudent(null);
        setFormData({ username: '', email: '', password: '', confirmPassword: '' });
        setShowModal(true);
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudent(student);
        setFormData({ username: student.username, email: student.email, password: '', confirmPassword: '' });
        setShowModal(true);
    };

    const handleDeleteStudent = (id: number) => {
        setConfirmDialog({
            message: 'Möchten Sie diesen Studenten wirklich löschen?',
            onConfirm: async () => {
                try {
                    await axios.delete(`http://localhost:8080/api/users/${id}`);
                    loadStudents();
                    showToast('Student erfolgreich gelöscht!', 'success');
                } catch (error) {
                    console.error('Fehler beim Löschen:', error);
                    showToast('Fehler beim Löschen des Studenten', 'error');
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleSubmitStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingStudent && formData.password !== formData.confirmPassword) {
            showToast('Passwörter stimmen nicht überein', 'error');
            return;
        }
        
        try {
            if (editingStudent) {
                // Update
                await axios.put(`http://localhost:8080/api/users/${editingStudent.id}`, {
                    username: formData.username,
                    email: formData.email
                });
            } else {
                // Create - Register-Endpoint erwartet username, email, password, confirmPassword
                await axios.post('http://localhost:8080/api/auth/register', {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                });
            }
            setShowModal(false);
            loadStudents();
        } catch (error: any) {
            console.error('Fehler beim Speichern:', error);
            const errorMsg = error.response?.data?.message || 'Fehler beim Speichern des Studenten';
            showToast(errorMsg, 'error');
        }
    };

    const loadTeachers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/teachers');
            console.log('Geladene Dozenten:', response.data);
            setTeachers(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Dozenten:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeacher = () => {
        setEditingTeacher(null);
        setTeacherFormData({
            firstName: '',
            lastName: '',
            birthDate: '',
            birthPlace: '',
            qualifications: '',
            subject: ''
        });
        setShowTeacherModal(true);
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setTeacherFormData({
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            birthDate: teacher.birthDate,
            birthPlace: teacher.birthPlace,
            qualifications: teacher.qualifications,
            subject: teacher.subject
        });
        setShowTeacherModal(true);
    };

    const handleDeleteTeacher = (id: number) => {
        setConfirmDialog({
            message: 'Möchten Sie diesen Dozenten wirklich löschen?',
            onConfirm: async () => {
                try {
                    await axios.delete(`http://localhost:8080/api/teachers/${id}`);
                    loadTeachers();
                    showToast('Dozent erfolgreich gelöscht!', 'success');
                } catch (error) {
                    console.error('Fehler beim Löschen:', error);
                    showToast('Fehler beim Löschen des Dozenten', 'error');
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleSubmitTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmitTeacher aufgerufen');
        console.log('teacherFormData:', teacherFormData);
        
        try {
            if (editingTeacher) {
                // Update
                console.log('Update Dozent:', editingTeacher.id);
                await axios.put(`http://localhost:8080/api/teachers/${editingTeacher.id}`, teacherFormData);
            } else {
                // Create
                console.log('Erstelle neuen Dozenten');
                const response = await axios.post('http://localhost:8080/api/teachers', teacherFormData);
                console.log('Response:', response.data);
            }
            setShowTeacherModal(false);
            loadTeachers();
            showToast('Dozent erfolgreich gespeichert!', 'success');
        } catch (error: any) {
            console.error('Fehler beim Speichern:', error);
            console.error('Error response:', error.response);
            const errorMsg = error.response?.data?.message || 'Fehler beim Speichern des Dozenten';
            showToast(errorMsg, 'error');
        }
    };

    const loadCourses = async () => {
        console.log('loadCourses aufgerufen');
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/courses');
            console.log('Kurse geladen:', response.data);
            setCourses(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Kurse:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = () => {
        setEditingCourse(null);
        setCourseFormData({ name: '', description: '' });
        setShowCourseModal(true);
    };

    const handleEditCourse = (course: Course) => {
        setEditingCourse(course);
        setCourseFormData({ name: course.name, description: course.description });
        setShowCourseModal(true);
    };

    const handleDeleteCourse = (id: number) => {
        setConfirmDialog({
            message: 'Möchten Sie diesen Kurs wirklich löschen?',
            onConfirm: async () => {
                try {
                    await axios.delete(`http://localhost:8080/api/courses/${id}`);
                    loadCourses();
                    showToast('Kurs erfolgreich gelöscht!', 'success');
                } catch (error) {
                    console.error('Fehler beim Löschen:', error);
                    showToast('Fehler beim Löschen des Kurses', 'error');
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleSubmitCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editingCourse) {
                // Update
                await axios.put(`http://localhost:8080/api/courses/${editingCourse.id}`, courseFormData);
            } else {
                // Create - TODO: Backend needs POST endpoint
                await axios.post('http://localhost:8080/api/courses', courseFormData);
            }
            setShowCourseModal(false);
            loadCourses();
            showToast('Kurs erfolgreich gespeichert!', 'success');
        } catch (error: any) {
            console.error('Fehler beim Speichern:', error);
            const errorMsg = error.response?.data?.message || 'Fehler beim Speichern des Kurses';
            showToast(errorMsg, 'error');
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        navigate('/admin');
    };

    return (
        <div className="admin-dashboard-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h1 className="admin-sidebar-logo">CourseHub Admin</h1>
                    <p className="admin-sidebar-user">{adminUser}</p>
                </div>

                <nav className="admin-sidebar-nav">
                    <button
                        className={`admin-nav-item ${activeView === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveView('overview')}
                    >
                        <img src={devopsIcon} alt="Übersicht" className="admin-nav-icon-img" />
                        Übersicht
                    </button>

                    <button
                        className={`admin-nav-item ${activeView === 'students' ? 'active' : ''}`}
                        onClick={() => setActiveView('students')}
                    >
                        <img src={lernIcon} alt="Studenten" className="admin-nav-icon-img" />
                        Studenten
                    </button>

                    <button
                        className={`admin-nav-item ${activeView === 'teachers' ? 'active' : ''}`}
                        onClick={() => setActiveView('teachers')}
                    >
                        <img src={kroneIcon} alt="Dozenten" className="admin-nav-icon-img" />
                        Dozenten
                    </button>

                    <button
                        className={`admin-nav-item ${activeView === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveView('courses')}
                    >
                        <img src={kurseIcon} alt="Kurse" className="admin-nav-icon-img" />
                        Kurse
                    </button>

                    <button
                        className={`admin-nav-item ${activeView === 'enrollments' ? 'active' : ''}`}
                        onClick={() => setActiveView('enrollments')}
                    >
                        Einschreibungen
                    </button>

                    <button
                        className={`admin-nav-item ${activeView === 'certificates' ? 'active' : ''}`}
                        onClick={() => setActiveView('certificates')}
                    >
                        Zertifikate
                    </button>

                    <button
                        className={`admin-nav-item ${activeView === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveView('settings')}
                    >
                        <span className="admin-nav-icon">⚙️</span>
                        Einstellungen
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <button className="admin-logout-button" onClick={handleLogout}>
                        Abmelden
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main-content">
                <header className="admin-content-header">
                    <h2 className="admin-content-title">
                        {activeView === 'overview' && 'Dashboard Übersicht'}
                        {activeView === 'students' && 'Studentenverwaltung'}
                        {activeView === 'teachers' && 'Dozentenverwaltung'}
                        {activeView === 'courses' && 'Kursverwaltung'}
                        {activeView === 'enrollments' && 'Einschreibungen'}
                        {activeView === 'certificates' && 'Zertifikate'}
                        {activeView === 'settings' && 'Einstellungen'}
                    </h2>
                </header>

                <div className="admin-content-body">
                    {activeView === 'overview' && (
                        <div className="admin-overview">
                            {/* Toast Benachrichtigung */}
                            {toast && (
                                <div className={`admin-toast admin-toast-${toast.type}`}>
                                    <span className="admin-toast-icon">
                                        {toast.type === 'success' ? '✓' : '×'}
                                    </span>
                                    <span className="admin-toast-message">{toast.message}</span>
                                </div>
                            )}

                            {/* Confirm Dialog */}
                            {confirmDialog && (
                                <div className="admin-confirm-overlay" onClick={() => setConfirmDialog(null)}>
                                    <div className="admin-confirm-dialog" onClick={(e) => e.stopPropagation()}>
                                        <div className="admin-confirm-icon">⚠️</div>
                                        <h3 className="admin-confirm-title">Bestätigung erforderlich</h3>
                                        <p className="admin-confirm-message">{confirmDialog.message}</p>
                                        <div className="admin-confirm-actions">
                                            <button 
                                                className="admin-confirm-button cancel"
                                                onClick={() => setConfirmDialog(null)}
                                            >
                                                Abbrechen
                                            </button>
                                            <button 
                                                className="admin-confirm-button confirm"
                                                onClick={confirmDialog.onConfirm}
                                            >
                                                Löschen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="admin-stats-grid">
                                <div className="admin-stat-card">
                                    <img src={lernIcon} alt="Studenten" className="admin-stat-icon-img" />
                                    <div className="admin-stat-info">
                                        <p className="admin-stat-label">Studenten</p>
                                        <p className="admin-stat-value">{statistics.totalStudents}</p>
                                    </div>
                                </div>

                                <div className="admin-stat-card">
                                    <img src={kroneIcon} alt="Dozenten" className="admin-stat-icon-img" />
                                    <div className="admin-stat-info">
                                        <p className="admin-stat-label">Dozenten</p>
                                        <p className="admin-stat-value">{statistics.totalTeachers}</p>
                                    </div>
                                </div>

                                <div className="admin-stat-card">
                                    <img src={kurseIcon} alt="Kurse" className="admin-stat-icon-img" />
                                    <div className="admin-stat-info">
                                        <p className="admin-stat-label">Kurse</p>
                                        <p className="admin-stat-value">{statistics.totalCourses}</p>
                                    </div>
                                </div>

                                <div className="admin-stat-card">
                                    <img src={devopsIcon} alt="Einschreibungen" className="admin-stat-icon-img" />
                                    <div className="admin-stat-info">
                                        <p className="admin-stat-label">Einschreibungen</p>
                                        <p className="admin-stat-value">{statistics.totalEnrollments}</p>
                                    </div>
                                </div>

                                <div className="admin-stat-card">
                                    <img src={kroneIcon} alt="Zertifikate" className="admin-stat-icon-img" />
                                    <div className="admin-stat-info">
                                        <p className="admin-stat-label">Zertifikate</p>
                                        <p className="admin-stat-value">{statistics.totalCertificates}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-welcome-message">
                                <h3>Willkommen im Admin Dashboard!</h3>
                                <p>Wählen Sie einen Bereich aus dem Menü, um zu beginnen.</p>
                            </div>
                        </div>
                    )}

                    {activeView === 'students' && (
                        <div className="admin-section">
                            <div className="admin-section-header">
                                <button className="admin-create-button" onClick={handleCreateStudent}>
                                    + Neuer Student
                                </button>
                            </div>

                            {loading ? (
                                <p className="admin-loading">Laden...</p>
                            ) : (
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Benutzername</th>
                                                <th>E-Mail</th>
                                                <th>Erstellt am</th>
                                                <th>Aktionen</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="admin-table-empty">
                                                        Keine Studenten gefunden
                                                    </td>
                                                </tr>
                                            ) : (
                                                students.map(student => (
                                                    <tr key={student.id}>
                                                        <td>{student.id}</td>
                                                        <td>{student.username}</td>
                                                        <td>{student.email}</td>
                                                        <td>{new Date(student.createdAt).toLocaleDateString('de-DE')}</td>
                                                        <td>
                                                            <div className="admin-table-actions">
                                                                <button 
                                                                    className="admin-action-button edit"
                                                                    onClick={() => handleEditStudent(student)}
                                                                >
                                                                    Bearbeiten
                                                                </button>
                                                                <button 
                                                                    className="admin-action-button delete"
                                                                    onClick={() => handleDeleteStudent(student.id)}
                                                                >
                                                                    Löschen
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Modal für Erstellen/Bearbeiten */}
                            {showModal && (
                                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                                        <div className="admin-modal-header">
                                            <h3>{editingStudent ? 'Student bearbeiten' : 'Neuer Student'}</h3>
                                            <button className="admin-modal-close" onClick={() => setShowModal(false)}>
                                                &times;
                                            </button>
                                        </div>
                                        <form onSubmit={handleSubmitStudent} className="admin-modal-form">
                                            <div className="admin-form-group">
                                                <label>Benutzername</label>
                                                <input
                                                    type="text"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>E-Mail</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            {!editingStudent && (
                                                <>
                                                    <div className="admin-form-group">
                                                        <label>Passwort</label>
                                                        <input
                                                            type="password"
                                                            value={formData.password}
                                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                            required
                                                            className="admin-input"
                                                            minLength={6}
                                                        />
                                                    </div>
                                                    <div className="admin-form-group">
                                                        <label>Passwort bestätigen</label>
                                                        <input
                                                            type="password"
                                                            value={formData.confirmPassword}
                                                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                                            required
                                                            className="admin-input"
                                                            minLength={6}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            <div className="admin-modal-actions">
                                                <button type="button" className="admin-button-secondary" onClick={() => setShowModal(false)}>
                                                    Abbrechen
                                                </button>
                                                <button type="submit" className="admin-button-primary">
                                                    {editingStudent ? 'Speichern' : 'Erstellen'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'teachers' && (
                        <div className="admin-section">
                            {/* Optionen-Menü */}
                            <div className="admin-section-header">
                                <div className="admin-tabs">
                                    <button 
                                        className={`admin-tab ${teacherView === 'list' ? 'active' : ''}`}
                                        onClick={() => setTeacherView('list')}
                                    >
                                        Alle Dozenten
                                    </button>
                                    <button 
                                        className={`admin-tab ${teacherView === 'create' ? 'active' : ''}`}
                                        onClick={() => setTeacherView('create')}
                                    >
                                        Profil erstellen
                                    </button>
                                </div>
                            </div>

                            {/* Liste aller Dozenten */}
                            {teacherView === 'list' && (
                                <>
                                    {loading ? (
                                        <p className="admin-loading">Laden...</p>
                                    ) : (
                                        <div className="admin-table-container">
                                            <table className="admin-table">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Vorname</th>
                                                        <th>Nachname</th>
                                                        <th>Geburtsdatum</th>
                                                        <th>Geburtsort</th>
                                                        <th>Fach</th>
                                                        <th>Aktionen</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {teachers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={7} className="admin-table-empty">
                                                                Keine Dozenten gefunden
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        teachers.map(teacher => (
                                                            <tr key={teacher.id}>
                                                                <td>{teacher.id}</td>
                                                                <td>{teacher.firstName}</td>
                                                                <td>{teacher.lastName}</td>
                                                                <td>{new Date(teacher.birthDate).toLocaleDateString('de-DE')}</td>
                                                                <td>{teacher.birthPlace}</td>
                                                                <td>{teacher.subject}</td>
                                                                <td>
                                                                    <div className="admin-table-actions">
                                                                        <button 
                                                                            className="admin-action-button edit"
                                                                            onClick={() => handleEditTeacher(teacher)}
                                                                        >
                                                                            Bearbeiten
                                                                        </button>
                                                                        <button 
                                                                            className="admin-action-button delete"
                                                                            onClick={() => handleDeleteTeacher(teacher.id)}
                                                                        >
                                                                            Löschen
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Profil erstellen */}
                            {teacherView === 'create' && !editingTeacher && (
                                <div className="admin-form-container">
                                    <h3 className="admin-form-title">Neues Dozentenprofil erstellen</h3>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        await handleSubmitTeacher(e);
                                        setTeacherView('list');
                                    }} className="admin-create-form">
                                        <div className="admin-form-row">
                                            <div className="admin-form-group">
                                                <label>Vorname *</label>
                                                <input
                                                    type="text"
                                                    value={teacherFormData.firstName}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, firstName: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Nachname *</label>
                                                <input
                                                    type="text"
                                                    value={teacherFormData.lastName}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, lastName: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="admin-form-row">
                                            <div className="admin-form-group">
                                                <label>Geburtsdatum *</label>
                                                <input
                                                    type="date"
                                                    value={teacherFormData.birthDate}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, birthDate: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Geburtsort *</label>
                                                <input
                                                    type="text"
                                                    value={teacherFormData.birthPlace}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, birthPlace: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                        </div>

                                        <div className="admin-form-group">
                                            <label>Fach *</label>
                                            <input
                                                type="text"
                                                value={teacherFormData.subject}
                                                onChange={(e) => setTeacherFormData({...teacherFormData, subject: e.target.value})}
                                                required
                                                className="admin-input"
                                                placeholder="z.B. Informatik, Mathematik, etc."
                                            />
                                        </div>

                                        <div className="admin-form-group">
                                            <label>Qualifikationen</label>
                                            <textarea
                                                value={teacherFormData.qualifications}
                                                onChange={(e) => setTeacherFormData({...teacherFormData, qualifications: e.target.value})}
                                                className="admin-textarea"
                                                rows={4}
                                                placeholder="z.B. Dr. in Informatik, 10 Jahre Erfahrung, etc."
                                            />
                                        </div>

                                        <div className="admin-form-actions">
                                            <button type="submit" className="admin-button-primary">
                                                Profil erstellen
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Modal für Bearbeiten */}
                            {showTeacherModal && editingTeacher && (
                                <div className="admin-modal-overlay" onClick={() => setShowTeacherModal(false)}>
                                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                                        <div className="admin-modal-header">
                                            <h3>Dozent bearbeiten</h3>
                                            <button className="admin-modal-close" onClick={() => setShowTeacherModal(false)}>
                                                &times;
                                            </button>
                                        </div>
                                        <form onSubmit={handleSubmitTeacher} className="admin-modal-form">
                                            <div className="admin-form-group">
                                                <label>Vorname</label>
                                                <input
                                                    type="text"
                                                    value={teacherFormData.firstName}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, firstName: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Nachname</label>
                                                <input
                                                    type="text"
                                                    value={teacherFormData.lastName}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, lastName: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Geburtsdatum</label>
                                                <input
                                                    type="date"
                                                    value={teacherFormData.birthDate}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, birthDate: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Geburtsort</label>
                                                <input
                                                    type="text"
                                                    value={teacherFormData.birthPlace}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, birthPlace: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Fach</label>
                                                <input
                                                    type="text"
                                                    value={teacherFormData.subject}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, subject: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Qualifikationen</label>
                                                <textarea
                                                    value={teacherFormData.qualifications}
                                                    onChange={(e) => setTeacherFormData({...teacherFormData, qualifications: e.target.value})}
                                                    className="admin-textarea"
                                                    rows={4}
                                                />
                                            </div>
                                            <div className="admin-modal-actions">
                                                <button type="button" className="admin-button-secondary" onClick={() => setShowModal(false)}>
                                                    Abbrechen
                                                </button>
                                                <button type="submit" className="admin-button-primary">
                                                    Speichern
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'courses' && (
                        <div className="admin-section">
                            <div className="admin-section-header">
                                <button className="admin-create-button" onClick={handleCreateCourse}>
                                    + Neuer Kurs
                                </button>
                            </div>

                            {loading ? (
                                <p className="admin-loading">Laden...</p>
                            ) : (
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Kursname</th>
                                                <th>Beschreibung</th>
                                                <th>Lernpfade</th>
                                                <th>Aktionen</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {courses.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="admin-table-empty">
                                                        Keine Kurse gefunden
                                                    </td>
                                                </tr>
                                            ) : (
                                                courses.map(course => (
                                                    <tr key={course.id}>
                                                        <td>{course.id}</td>
                                                        <td>{course.name}</td>
                                                        <td>{course.description}</td>
                                                        <td>{course.learningPaths?.length || 0}</td>
                                                        <td>
                                                            <div className="admin-table-actions">
                                                                <button 
                                                                    className="admin-action-button edit"
                                                                    onClick={() => handleEditCourse(course)}
                                                                >
                                                                    Bearbeiten
                                                                </button>
                                                                <button 
                                                                    className="admin-action-button delete"
                                                                    onClick={() => handleDeleteCourse(course.id)}
                                                                >
                                                                    Löschen
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Course Modal */}
                            {showCourseModal && (
                                <div className="admin-modal-overlay" onClick={() => setShowCourseModal(false)}>
                                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                                        <div className="admin-modal-header">
                                            <h3>{editingCourse ? 'Kurs bearbeiten' : 'Neuer Kurs'}</h3>
                                            <button 
                                                className="admin-modal-close"
                                                onClick={() => setShowCourseModal(false)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <form onSubmit={handleSubmitCourse} className="admin-modal-form">
                                            <div className="admin-form-group">
                                                <label>Kursname *</label>
                                                <input
                                                    type="text"
                                                    value={courseFormData.name}
                                                    onChange={(e) => setCourseFormData({...courseFormData, name: e.target.value})}
                                                    required
                                                    className="admin-input"
                                                />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Beschreibung</label>
                                                <textarea
                                                    value={courseFormData.description}
                                                    onChange={(e) => setCourseFormData({...courseFormData, description: e.target.value})}
                                                    className="admin-input"
                                                    rows={4}
                                                />
                                            </div>
                                            <div className="admin-modal-actions">
                                                <button 
                                                    type="button" 
                                                    className="admin-button-secondary"
                                                    onClick={() => setShowCourseModal(false)}
                                                >
                                                    Abbrechen
                                                </button>
                                                <button type="submit" className="admin-button-primary">
                                                    {editingCourse ? 'Aktualisieren' : 'Erstellen'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'enrollments' && (
                        <div className="admin-section">
                            <p className="admin-placeholder">Einschreibungen werden hier angezeigt...</p>
                        </div>
                    )}

                    {activeView === 'certificates' && (
                        <div className="admin-section">
                            <p className="admin-placeholder">Zertifikate werden hier angezeigt...</p>
                        </div>
                    )}

                    {activeView === 'settings' && (
                        <div className="admin-section">
                            <p className="admin-placeholder">Einstellungen werden hier angezeigt...</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Toast Benachrichtigung */}
            {toast && (
                <div className={`admin-toast admin-toast-${toast.type}`}>
                    <span className="admin-toast-icon">
                        {toast.type === 'success' ? '✓' : '×'}
                    </span>
                    <span className="admin-toast-message">{toast.message}</span>
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog && (
                <div className="admin-confirm-overlay" onClick={() => setConfirmDialog(null)}>
                    <div className="admin-confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-confirm-icon">⚠️</div>
                        <h3 className="admin-confirm-title">Bestätigung erforderlich</h3>
                        <p className="admin-confirm-message">{confirmDialog.message}</p>
                        <div className="admin-confirm-actions">
                            <button 
                                className="admin-confirm-button cancel"
                                onClick={() => setConfirmDialog(null)}
                            >
                                Abbrechen
                            </button>
                            <button 
                                className="admin-confirm-button confirm"
                                onClick={confirmDialog.onConfirm}
                            >
                                Löschen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;