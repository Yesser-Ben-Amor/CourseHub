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

interface Enrollment {
    id: number;
    userId: number;
    username: string;
    courseId: number;
    courseName: string;
    learningPathId: number;
    learningPathLevel: string;
    learningPathPoints: number;
    enrolledAt: string;
    progress: number;
    completed: boolean;
    completedAt?: string;
}

interface LearningPath {
    id: number;
    level: string;
    description?: string;
    points: number;
    durationWeeks: number;
    overview: string;
}

interface LearningContent {
    id: number;
    title: string;
    type: string; // VIDEO, TEXT, PDF, QUIZ
    description?: string;
    contentUrl: string;
    points: number;
    orderIndex: number;
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
    const [courseLearningPaths, setCourseLearningPaths] = useState<LearningPath[]>([]);
    const [showPathForm, setShowPathForm] = useState(false);
    const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
    const [pathFormData, setPathFormData] = useState({
        level: '',
        description: '',
        points: 100,
        durationWeeks: 12,
        overview: ''
    });
    const [selectedPathForContent, setSelectedPathForContent] = useState<LearningPath | null>(null);
    const [pathContents, setPathContents] = useState<LearningContent[]>([]);
    const [showContentForm, setShowContentForm] = useState(false);
    const [editingContent, setEditingContent] = useState<LearningContent | null>(null);
    const [contentFormData, setContentFormData] = useState({
        title: '',
        type: 'VIDEO',
        description: '',
        contentUrl: '',
        points: 10,
        orderIndex: 1
    });
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
    const [enrollmentFormData, setEnrollmentFormData] = useState({
        userId: 0,
        courseId: 0,
        learningPathId: 0,
        progress: 0
    });

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
        
        // Lade Einschreibungen wenn View aktiv ist
        if (activeView === 'enrollments') {
            loadEnrollments();
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
        setCourseLearningPaths([]);
        setShowCourseModal(true);
    };

    const handleEditCourse = (course: Course) => {
        setEditingCourse(course);
        setCourseFormData({ name: course.name, description: course.description });
        setCourseLearningPaths(course.learningPaths || []);
        setShowCourseModal(true);
    };

    const handleDeleteCourse = async (id: number) => {
    try {
        // Prüfe ob Enrollments existieren
        const response = await axios.get(`http://localhost:8080/api/courses/${id}/enrollment-count`);
        const enrollmentCount = response.data.count;

        let message = 'Möchten Sie diesen Kurs wirklich löschen?';
        if (enrollmentCount > 0) {
            message = `WARNUNG: Dieser Kurs hat ${enrollmentCount} aktive Einschreibung(en).\n\nWenn Sie fortfahren, werden ALLE Einschreibungen für diesen Kurs unwiderruflich gelöscht!\n\nMöchten Sie wirklich fortfahren?`;
        }

        setConfirmDialog({
            message: message,
            onConfirm: async () => {
                try {
                    await axios.delete(`http://localhost:8080/api/courses/${id}`);
                    loadCourses();
                    if (enrollmentCount > 0) {
                        showToast(`Kurs und ${enrollmentCount} Einschreibung(en) erfolgreich gelöscht!`, 'success');
                    } else {
                        showToast('Kurs erfolgreich gelöscht!', 'success');
                    }
                } catch (error: any) {
                    console.error('Fehler beim Löschen:', error);
                    const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Fehler beim Löschen des Kurses';
                    showToast(errorMsg, 'error');
                }
                setConfirmDialog(null);
            }
        });
    } catch (error) {
        console.error('Fehler beim Prüfen der Enrollments:', error);
        showToast('Fehler beim Prüfen der Einschreibungen', 'error');
            }
        };

    // LearningPath Management
    const handleAddPath = () => {
        setEditingPath(null);
        setPathFormData({
            level: '',
            description: '',
            points: 100,
            durationWeeks: 12,
            overview: ''
        });
        setShowPathForm(true);
    };

    const handleEditPath = (path: LearningPath) => {
        setEditingPath(path);
        setPathFormData({
            level: path.level,
            description: path.description || '',
            points: path.points,
            durationWeeks: path.durationWeeks,
            overview: path.overview
        });
        setShowPathForm(true);
    };

    const handleSavePath = async () => {
        if (!editingCourse) return;
        
        try {
            if (editingPath) {
                const response = await axios.put(
                    `http://localhost:8080/api/courses/${editingCourse.id}/paths/${editingPath.id}`,
                    pathFormData
                );
                setCourseLearningPaths(courseLearningPaths.map(p => 
                    p.id === editingPath.id ? response.data : p
                ));
                showToast('Lernpfad aktualisiert!', 'success');
            } else {
                const response = await axios.post(
                    `http://localhost:8080/api/courses/${editingCourse.id}/paths`,
                    pathFormData
                );
                setCourseLearningPaths([...courseLearningPaths, response.data]);
                showToast('Lernpfad erstellt!', 'success');
            }
            setShowPathForm(false);
            loadCourses();
        } catch (error: any) {
            console.error('Fehler beim Speichern:', error);
            showToast(error.response?.data?.error || 'Fehler beim Speichern', 'error');
        }
    };

    const handleDeletePath = async (pathId: number) => {
        if (!editingCourse) return;
        
        setConfirmDialog({
            message: 'Möchten Sie diesen Lernpfad wirklich löschen?',
            onConfirm: async () => {
                try {
                    await axios.delete(`http://localhost:8080/api/courses/${editingCourse.id}/paths/${pathId}`);
                    setCourseLearningPaths(courseLearningPaths.filter(p => p.id !== pathId));
                    showToast('Lernpfad gelöscht!', 'success');
                    loadCourses();
                } catch (error) {
                    console.error('Fehler beim Löschen:', error);
                    showToast('Fehler beim Löschen', 'error');
                }
                setConfirmDialog(null);
            }
        });
    };

    // LearningContent Management
    const handleManageContent = async (path: LearningPath) => {
        setSelectedPathForContent(path);
        try {
            const response = await axios.get(
                `http://localhost:8080/api/courses/${editingCourse?.id}/paths/${path.id}/contents`
            );
            setPathContents(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Inhalte:', error);
            setPathContents([]);
        }
    };

    const handleAddContent = () => {
        setEditingContent(null);
        setContentFormData({
            title: '',
            type: 'VIDEO',
            description: '',
            contentUrl: '',
            points: 10,
            orderIndex: pathContents.length + 1
        });
        setShowContentForm(true);
    };

    const handleEditContent = (content: LearningContent) => {
        setEditingContent(content);
        setContentFormData({
            title: content.title,
            type: content.type,
            description: content.description || '',
            contentUrl: content.contentUrl,
            points: content.points,
            orderIndex: content.orderIndex
        });
        setShowContentForm(true);
    };

    const handleSaveContent = async () => {
        if (!editingCourse || !selectedPathForContent) return;
        
        try {
            if (editingContent) {
                const response = await axios.put(
                    `http://localhost:8080/api/courses/${editingCourse.id}/paths/${selectedPathForContent.id}/contents/${editingContent.id}`,
                    contentFormData
                );
                setPathContents(pathContents.map(c => 
                    c.id === editingContent.id ? response.data : c
                ));
                showToast('Inhalt aktualisiert!', 'success');
            } else {
                const response = await axios.post(
                    `http://localhost:8080/api/courses/${editingCourse.id}/paths/${selectedPathForContent.id}/contents`,
                    contentFormData
                );
                setPathContents([...pathContents, response.data]);
                showToast('Inhalt erstellt!', 'success');
            }
            setShowContentForm(false);
        } catch (error: any) {
            console.error('Fehler beim Speichern:', error);
            showToast(error.response?.data?.error || 'Fehler beim Speichern', 'error');
        }
    };

    const handleDeleteContent = async (contentId: number) => {
        if (!editingCourse || !selectedPathForContent) return;
        
        setConfirmDialog({
            message: 'Möchten Sie diesen Inhalt wirklich löschen?',
            onConfirm: async () => {
                try {
                    await axios.delete(
                        `http://localhost:8080/api/courses/${editingCourse.id}/paths/${selectedPathForContent.id}/contents/${contentId}`
                    );
                    setPathContents(pathContents.filter(c => c.id !== contentId));
                    showToast('Inhalt gelöscht!', 'success');
                } catch (error) {
                    console.error('Fehler beim Löschen:', error);
                    showToast('Fehler beim Löschen', 'error');
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
            // Create
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

    const loadEnrollments = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/enrollments');
            setEnrollments(response.data);
        } catch (error) {
            console.error('Fehler beim Laden der Einschreibungen:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEnrollment = (id: number) => {
        setConfirmDialog({
            message: 'Möchten Sie diese Einschreibung wirklich löschen?',
            onConfirm: async () => {
                try {
                    await axios.delete(`http://localhost:8080/api/enrollments/${id}`);
                    loadEnrollments();
                    showToast('Einschreibung erfolgreich gelöscht!', 'success');
                } catch (error) {
                    console.error('Fehler beim Löschen:', error);
                    showToast('Fehler beim Löschen der Einschreibung', 'error');
                }
                setConfirmDialog(null);
            }
        });
    };

    const handleEditEnrollment = (enrollment: Enrollment) => {
        setEditingEnrollment(enrollment);
        setEnrollmentFormData({
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            learningPathId: enrollment.learningPathId,
            progress: enrollment.progress
        });
        setShowEnrollmentModal(true);
    };

    const handleSubmitEnrollment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editingEnrollment) {
                // Update Fortschritt
                await axios.put(`http://localhost:8080/api/enrollments/${editingEnrollment.id}/progress`, {
                    progress: enrollmentFormData.progress
                });
                showToast('Fortschritt erfolgreich aktualisiert!', 'success');
            } else {
                // Neue Einschreibung erstellen
                await axios.post('http://localhost:8080/api/enrollments', enrollmentFormData);
                showToast('Einschreibung erfolgreich erstellt!', 'success');
            }
            setShowEnrollmentModal(false);
            loadEnrollments();
        } catch (error: any) {
            console.error('Fehler beim Speichern:', error);
            const errorMsg = error.response?.data?.message || 'Fehler beim Speichern';
            showToast(errorMsg, 'error');
        }
    };

    const handleCreateEnrollment = () => {
        setEditingEnrollment(null);
        setEnrollmentFormData({
            userId: 0,
            courseId: 0,
            learningPathId: 0,
            progress: 0
        });
        setShowEnrollmentModal(true);
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

                                            {editingCourse && (
                                                <div className="admin-form-group">
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <label>Lernpfade ({courseLearningPaths.length})</label>
                                                        <button 
                                                            type="button"
                                                            className="admin-button-primary"
                                                            onClick={handleAddPath}
                                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}
                                                        >
                                                            + Lernpfad
                                                        </button>
                                                    </div>
                                                    {courseLearningPaths.length === 0 ? (
                                                        <p style={{ color: '#8b949e', fontSize: '0.875rem' }}>Keine Lernpfade vorhanden</p>
                                                    ) : (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                            {courseLearningPaths.map(path => (
                                                                <div key={path.id} style={{
                                                                    padding: '0.75rem',
                                                                    background: '#21262d',
                                                                    borderRadius: '6px',
                                                                    border: '1px solid #30363d'
                                                                }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{path.level}</div>
                                                                            <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                                                                                {path.points} Punkte • {path.durationWeeks} Wochen
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleManageContent(path)}
                                                                                style={{
                                                                                    padding: '0.25rem 0.5rem',
                                                                                    fontSize: '0.75rem',
                                                                                    background: '#1f6feb',
                                                                                    color: '#ffffff',
                                                                                    border: 'none',
                                                                                    borderRadius: '4px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                Inhalte
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleEditPath(path)}
                                                                                style={{
                                                                                    padding: '0.25rem 0.5rem',
                                                                                    fontSize: '0.75rem',
                                                                                    background: '#238636',
                                                                                    color: '#ffffff',
                                                                                    border: 'none',
                                                                                    borderRadius: '4px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                Bearbeiten
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeletePath(path.id)}
                                                                                style={{
                                                                                    padding: '0.25rem 0.5rem',
                                                                                    fontSize: '0.75rem',
                                                                                    background: '#da3633',
                                                                                    color: '#ffffff',
                                                                                    border: 'none',
                                                                                    borderRadius: '4px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                Löschen
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

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

                            {/* LearningPath Form Modal */}
                            {showPathForm && (
                                <div className="admin-modal-overlay" onClick={() => setShowPathForm(false)}>
                                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                                        <div className="admin-modal-header">
                                            <h3>{editingPath ? 'Lernpfad bearbeiten' : 'Neuer Lernpfad'}</h3>
                                            <button className="admin-modal-close" onClick={() => setShowPathForm(false)}>×</button>
                                        </div>
                                        <div className="admin-modal-form">
                                            <div className="admin-form-group">
                                                <label>Level *</label>
                                                <select value={pathFormData.level} onChange={(e) => setPathFormData({...pathFormData, level: e.target.value})} required className="admin-input">
                                                    <option value="">Wählen...</option>
                                                    <option value="Anfänger">Anfänger</option>
                                                    <option value="Fortgeschrittene">Fortgeschrittene</option>
                                                    <option value="Profis">Profis</option>
                                                </select>
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Punkte *</label>
                                                <input type="number" value={pathFormData.points} onChange={(e) => setPathFormData({...pathFormData, points: parseInt(e.target.value) || 0})} required className="admin-input" />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Dauer (Wochen) *</label>
                                                <input type="number" value={pathFormData.durationWeeks} onChange={(e) => setPathFormData({...pathFormData, durationWeeks: parseInt(e.target.value) || 0})} required className="admin-input" />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Übersicht *</label>
                                                <textarea value={pathFormData.overview} onChange={(e) => setPathFormData({...pathFormData, overview: e.target.value})} required className="admin-input" rows={3} placeholder="Kurze Beschreibung des Lernpfads..." />
                                            </div>
                                            <div className="admin-modal-actions">
                                                <button type="button" className="admin-button-secondary" onClick={() => setShowPathForm(false)}>Abbrechen</button>
                                                <button type="button" className="admin-button-primary" onClick={handleSavePath}>{editingPath ? 'Aktualisieren' : 'Erstellen'}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Content Management Modal */}
                            {selectedPathForContent && (
                                <div className="admin-modal-overlay" onClick={() => setSelectedPathForContent(null)}>
                                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                                        <div className="admin-modal-header">
                                            <h3>Inhalte verwalten: {selectedPathForContent.level}</h3>
                                            <button className="admin-modal-close" onClick={() => setSelectedPathForContent(null)}>×</button>
                                        </div>
                                        <div className="admin-modal-form">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h4>Lerninhalte ({pathContents.length})</h4>
                                                <button type="button" className="admin-button-primary" onClick={handleAddContent} style={{ padding: '0.5rem 1rem' }}>+ Inhalt hinzufügen</button>
                                            </div>
                                            {pathContents.length === 0 ? (
                                                <p style={{ color: '#8b949e', textAlign: 'center', padding: '2rem' }}>Keine Inhalte vorhanden</p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {pathContents.map(content => (
                                                        <div key={content.id} style={{ padding: '1rem', background: '#21262d', borderRadius: '6px', border: '1px solid #30363d' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                                        <span style={{ fontWeight: '500', fontSize: '1rem' }}>{content.title}</span>
                                                                        <span style={{ padding: '0.125rem 0.5rem', background: '#1f6feb', borderRadius: '4px', fontSize: '0.75rem' }}>{content.type}</span>
                                                                        <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>{content.points} Punkte</span>
                                                                    </div>
                                                                    {content.description && <p style={{ fontSize: '0.875rem', color: '#8b949e', marginBottom: '0.5rem' }}>{content.description}</p>}
                                                                    <p style={{ fontSize: '0.75rem', color: '#58a6ff', wordBreak: 'break-all' }}>{content.contentUrl}</p>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                    <button type="button" onClick={() => handleEditContent(content)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#238636', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Bearbeiten</button>
                                                                    <button type="button" onClick={() => handleDeleteContent(content.id)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#da3633', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Löschen</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Content Form Modal */}
                            {showContentForm && (
                                <div className="admin-modal-overlay" onClick={() => setShowContentForm(false)}>
                                    <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                                        <div className="admin-modal-header">
                                            <h3>{editingContent ? 'Inhalt bearbeiten' : 'Neuer Inhalt'}</h3>
                                            <button className="admin-modal-close" onClick={() => setShowContentForm(false)}>×</button>
                                        </div>
                                        <div className="admin-modal-form">
                                            <div className="admin-form-group">
                                                <label>Titel *</label>
                                                <input type="text" value={contentFormData.title} onChange={(e) => setContentFormData({...contentFormData, title: e.target.value})} required className="admin-input" placeholder="z.B. Einführung in DevOps" />
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Typ *</label>
                                                <select value={contentFormData.type} onChange={(e) => setContentFormData({...contentFormData, type: e.target.value})} required className="admin-input">
                                                    <option value="VIDEO">Video</option>
                                                    <option value="TEXT">Text</option>
                                                    <option value="PDF">PDF</option>
                                                    <option value="QUIZ">Quiz</option>
                                                </select>
                                            </div>
                                            <div className="admin-form-group">
                                                <label>URL *</label>
                                                <input type="url" value={contentFormData.contentUrl} onChange={(e) => setContentFormData({...contentFormData, contentUrl: e.target.value})} required className="admin-input" placeholder="https://www.youtube.com/watch?v=..." />
                                                <small style={{ color: '#8b949e', fontSize: '0.75rem' }}>YouTube-Link, PDF-URL, etc.</small>
                                            </div>
                                            <div className="admin-form-group">
                                                <label>Beschreibung</label>
                                                <textarea value={contentFormData.description} onChange={(e) => setContentFormData({...contentFormData, description: e.target.value})} className="admin-input" rows={3} placeholder="Optionale Beschreibung..." />
                                            </div>
                                            <div className="admin-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div className="admin-form-group">
                                                    <label>Punkte *</label>
                                                    <input type="number" value={contentFormData.points} onChange={(e) => setContentFormData({...contentFormData, points: parseInt(e.target.value) || 0})} required className="admin-input" min="0" />
                                                </div>
                                                <div className="admin-form-group">
                                                    <label>Reihenfolge *</label>
                                                    <input type="number" value={contentFormData.orderIndex} onChange={(e) => setContentFormData({...contentFormData, orderIndex: parseInt(e.target.value) || 1})} required className="admin-input" min="1" />
                                                </div>
                                            </div>
                                            <div className="admin-modal-actions">
                                                <button type="button" className="admin-button-secondary" onClick={() => setShowContentForm(false)}>Abbrechen</button>
                                                <button type="button" className="admin-button-primary" onClick={handleSaveContent}>{editingContent ? 'Aktualisieren' : 'Erstellen'}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'enrollments' && (
                        <div className="admin-section">
                            <div className="admin-section-header">
                                <button className="admin-create-button" onClick={handleCreateEnrollment}>
                                    + Neue Einschreibung
                                </button>
                            </div>

                            {loading ? (
                                <p className="admin-loading">Laden...</p>
                            ) : (
                                <div className="admin-table-container">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Student</th>
                                                <th>Kurs & Lernpfad</th>
                                                <th>Fortschritt</th>
                                                <th>Status</th>
                                                <th>Datum</th>
                                                <th>Aktionen</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrollments.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="admin-table-empty">
                                                        Keine Einschreibungen gefunden
                                                    </td>
                                                </tr>
                                            ) : (
                                                enrollments.map(enrollment => (
                                                    <tr key={enrollment.id}>
                                                        <td>{enrollment.username}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                                <span style={{ fontWeight: '500' }}>{enrollment.courseName}</span>
                                                                <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                                                                    {enrollment.learningPathLevel} ({enrollment.learningPathPoints} Punkte)
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <div style={{
                                                                    width: '100px',
                                                                    height: '8px',
                                                                    background: '#21262d',
                                                                    borderRadius: '4px',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    <div style={{
                                                                        width: `${enrollment.progress}%`,
                                                                        height: '100%',
                                                                        background: enrollment.completed ? '#238636' : '#58a6ff',
                                                                        transition: 'width 0.3s'
                                                                    }} />
                                                                </div>
                                                                <span>{enrollment.progress}%</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span style={{
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '4px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: '500',
                                                                background: enrollment.completed ? '#238636' : '#58a6ff',
                                                                color: '#ffffff'
                                                            }}>
                                                                {enrollment.completed ? 'Abgeschlossen' : 'Aktiv'}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(enrollment.enrolledAt).toLocaleDateString('de-DE')}</td>
                                                        <td>
                                                            <div className="admin-table-actions">
                                                                <button 
                                                                    className="admin-action-button edit"
                                                                    onClick={() => handleEditEnrollment(enrollment)}
                                                                >
                                                                    Bearbeiten
                                                                </button>
                                                                <button 
                                                                    className="admin-action-button delete"
                                                                    onClick={() => handleDeleteEnrollment(enrollment.id)}
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

            {/* Enrollment Modal */}
            {showEnrollmentModal && (
                <div className="admin-modal-overlay" onClick={() => setShowEnrollmentModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{editingEnrollment ? 'Einschreibung bearbeiten' : 'Neue Einschreibung'}</h3>
                            <button 
                                className="admin-modal-close"
                                onClick={() => setShowEnrollmentModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmitEnrollment} className="admin-modal-form">
                            {editingEnrollment ? (
                                <>
                                    <div className="admin-form-group">
                                        <label>Student</label>
                                        <input
                                            type="text"
                                            value={editingEnrollment.username}
                                            disabled
                                            className="admin-input"
                                            style={{ background: '#21262d', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Kurs</label>
                                        <input
                                            type="text"
                                            value={`${editingEnrollment.courseName} - ${editingEnrollment.learningPathLevel}`}
                                            disabled
                                            className="admin-input"
                                            style={{ background: '#21262d', cursor: 'not-allowed' }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="admin-form-group">
                                        <label>User ID *</label>
                                        <input
                                            type="number"
                                            value={enrollmentFormData.userId || ''}
                                            onChange={(e) => setEnrollmentFormData({...enrollmentFormData, userId: parseInt(e.target.value) || 0})}
                                            required
                                            className="admin-input"
                                            placeholder="z.B. 1"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Course ID *</label>
                                        <input
                                            type="number"
                                            value={enrollmentFormData.courseId || ''}
                                            onChange={(e) => setEnrollmentFormData({...enrollmentFormData, courseId: parseInt(e.target.value) || 0})}
                                            required
                                            className="admin-input"
                                            placeholder="z.B. 1"
                                        />
                                    </div>
                                    <div className="admin-form-group">
                                        <label>Learning Path ID *</label>
                                        <input
                                            type="number"
                                            value={enrollmentFormData.learningPathId || ''}
                                            onChange={(e) => setEnrollmentFormData({...enrollmentFormData, learningPathId: parseInt(e.target.value) || 0})}
                                            required
                                            className="admin-input"
                                            placeholder="z.B. 1 (Anfänger), 2 (Fortgeschrittene), 3 (Profis)"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="admin-form-group">
                                <label>Fortschritt (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={enrollmentFormData.progress}
                                    onChange={(e) => setEnrollmentFormData({...enrollmentFormData, progress: parseInt(e.target.value) || 0})}
                                    required
                                    className="admin-input"
                                />
                                <div style={{
                                    marginTop: '0.5rem',
                                    width: '100%',
                                    height: '8px',
                                    background: '#21262d',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${enrollmentFormData.progress}%`,
                                        height: '100%',
                                        background: enrollmentFormData.progress >= 100 ? '#238636' : '#58a6ff',
                                        transition: 'width 0.3s'
                                    }} />
                                </div>
                            </div>
                            <div className="admin-modal-actions">
                                <button 
                                    type="button" 
                                    className="admin-button-secondary"
                                    onClick={() => setShowEnrollmentModal(false)}
                                >
                                    Abbrechen
                                </button>
                                <button type="submit" className="admin-button-primary">
                                    {editingEnrollment ? 'Speichern' : 'Erstellen'}
                                </button>
                            </div>
                        </form>
                    </div>
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