import React, { useState } from 'react';
import type { StudentSubmission, User, SubmissionFormData } from '../../types/seminar.types';

interface SubmissionPoolProps {
    submissions: StudentSubmission[];
    user: User | null;
    isInstructor: boolean;
    onSubmitWork: (submissionData: SubmissionFormData) => Promise<void>;
    onGradeSubmission?: (submissionId: number, feedback: string, grade: number) => Promise<void>;
}

interface GradingData {
    submissionId: number;
    feedback: string;
    grade: number;
}

const SubmissionPool: React.FC<SubmissionPoolProps> = ({
                                                           submissions,
                                                           user,
                                                           isInstructor,
                                                           onSubmitWork,
                                                           onGradeSubmission
                                                       }) => {
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [showGradingModal, setShowGradingModal] = useState(false);
    const [submissionData, setSubmissionData] = useState<SubmissionFormData>({
        studentId: 0,
        studentName: '',
        title: '',
        description: '',
        type: 'LINK',
        url: '',
        file: undefined
    });
    const [gradingData, setGradingData] = useState<GradingData>({
        submissionId: 0,
        feedback: '',
        grade: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filter, setFilter] = useState<'ALL' | 'GRADED' | 'UNGRADED'>('ALL');

    const resetSubmissionForm = (): void => {
        setSubmissionData({
            studentId: user?.id || 0,
            studentName: user?.username || '',
            title: '',
            description: '',
            type: 'LINK',
            url: '',
            file: undefined
        });
    };

    const handleSubmissionSubmit = async (): Promise<void> => {
        if (!user || !submissionData.title.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmitWork({
                ...submissionData,
                studentId: user.id,
                studentName: user.username
            });
            setShowSubmissionForm(false);
            resetSubmissionForm();
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGradeSubmission = async (): Promise<void> => {
        if (!onGradeSubmission || !gradingData.submissionId) return;

        try {
            await onGradeSubmission(gradingData.submissionId, gradingData.feedback, gradingData.grade);
            setShowGradingModal(false);
            setGradingData({ submissionId: 0, feedback: '', grade: 0 });
        } catch (error) {
            console.error('Grading error:', error);
        }
    };

    const openGradingModal = (submission: StudentSubmission): void => {
        setGradingData({
            submissionId: submission.id,
            feedback: submission.instructorFeedback || '',
            grade: submission.grade || 0
        });
        setShowGradingModal(true);
    };

    const getSubmissionIcon = (type: string): string => {
        switch (type) {
            case 'LINK': return '🔗';
            case 'IMAGE': return '🖼️';
            case 'VIDEO': return '🎥';
            case 'DOCUMENT': return '📄';
            default: return '📎';
        }
    };

    const getGradeColor = (grade: number): string => {
        if (grade >= 90) return '#4CAF50'; // Grün
        if (grade >= 70) return '#FF9800'; // Orange
        if (grade >= 50) return '#FFC107'; // Gelb
        return '#F44336'; // Rot
    };

    const filteredSubmissions = submissions.filter(submission => {
        switch (filter) {
            case 'GRADED': return submission.grade !== undefined && submission.grade !== null;
            case 'UNGRADED': return submission.grade === undefined || submission.grade === null;
            default: return true;
        }
    });

    const userSubmissions = submissions.filter(s => s.studentName === user?.username);

    return (
        <div className="submission-pool">
            {/* Header */}
            <div className="submissions-header">
                <div className="header-info">
                    <h3>📤 Abgaben ({submissions.length})</h3>
                    {!isInstructor && (
                        <span className="user-submissions">
                            Deine Abgaben: {userSubmissions.length}
                        </span>
                    )}
                </div>

                <div className="header-actions">
                    {/* Filter für Instructors */}
                    {isInstructor && (
                        <div className="filter-group">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as 'ALL' | 'GRADED' | 'UNGRADED')}
                                className="filter-select"
                            >
                                <option value="ALL">Alle Abgaben</option>
                                <option value="GRADED">Bewertet</option>
                                <option value="UNGRADED">Unbewertet</option>
                            </select>
                        </div>
                    )}

                    {/* Submit Button für Students */}
                    {!isInstructor && (
                        <button
                            onClick={() => {
                                resetSubmissionForm();
                                setShowSubmissionForm(true);
                            }}
                            className="submit-btn"
                        >
                            📤 Arbeit einreichen
                        </button>
                    )}
                </div>
            </div>

            {/* Submissions List */}
            <div className="submissions-list">
                {filteredSubmissions.length === 0 ? (
                    <div className="no-submissions">
                        <p>
                            {filter === 'ALL'
                                ? 'Noch keine Abgaben vorhanden'
                                : `Keine ${filter === 'GRADED' ? 'bewerteten' : 'unbewerteten'} Abgaben`
                            }
                        </p>
                    </div>
                ) : (
                    <div className="submissions-grid">
                        {filteredSubmissions.map(submission => (
                            <div key={submission.id} className="submission-item">
                                <div className="submission-header">
                                    <div className="submission-meta">
                                        <span className="submission-icon">
                                            {getSubmissionIcon(submission.submissionType)}
                                        </span>
                                        <div className="submission-info">
                                            <h4 className="submission-title">{submission.title}</h4>
                                            <div className="submission-details">
                                                <span className="student-name">👤 {submission.studentName}</span>
                                                <span className="submission-time">
                                                    🕒 {new Date(submission.submissionTime).toLocaleString('de-DE')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grade Display */}
                                    {submission.grade !== undefined && submission.grade !== null && (
                                        <div
                                            className="grade-badge"
                                            style={{ backgroundColor: getGradeColor(submission.grade) }}
                                        >
                                            {submission.grade}/100
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {submission.description && (
                                    <div className="submission-description">
                                        <p>{submission.description}</p>
                                    </div>
                                )}

                                {/* Content Link/File */}
                                <div className="submission-content">
                                    {submission.submissionType === 'LINK' ? (
                                        <a
                                            href={submission.contentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="content-link"
                                        >
                                            🔗 Link öffnen
                                        </a>
                                    ) : (
                                        <div className="file-info">
                                            <span>📁 {submission.fileName}</span>
                                            <button
                                                onClick={() => window.open(submission.contentUrl, '_blank')}
                                                className="download-btn"
                                            >
                                                ⬇️ Herunterladen
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Instructor Feedback */}
                                {submission.instructorFeedback && (
                                    <div className="instructor-feedback">
                                        <strong>💬 Feedback:</strong>
                                        <p>{submission.instructorFeedback}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                {isInstructor && onGradeSubmission && (
                                    <div className="submission-actions">
                                        <button
                                            onClick={() => openGradingModal(submission)}
                                            className="grade-btn"
                                        >
                                            {submission.grade ? '✏️ Bewertung ändern' : '📝 Bewerten'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Submission Form Modal */}
            {showSubmissionForm && (
                <div className="modal-overlay" onClick={() => setShowSubmissionForm(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📤 Arbeit einreichen</h3>
                            <button
                                onClick={() => setShowSubmissionForm(false)}
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Titel *</label>
                                <input
                                    type="text"
                                    value={submissionData.title}
                                    onChange={(e) => setSubmissionData(prev => ({
                                        ...prev,
                                        title: e.target.value
                                    }))}
                                    placeholder="Titel der Abgabe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Beschreibung</label>
                                <textarea
                                    value={submissionData.description}
                                    onChange={(e) => setSubmissionData(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    placeholder="Optionale Beschreibung"
                                    rows={3}
                                />
                            </div>

                            <div className="form-group">
                                <label>Typ</label>
                                <select
                                    value={submissionData.type}
                                    onChange={(e) => setSubmissionData(prev => ({
                                        ...prev,
                                        type: e.target.value as 'LINK' | 'FILE'
                                    }))}
                                >
                                    <option value="LINK">🔗 Link (YouTube, GitHub, etc.)</option>
                                    <option value="FILE">📁 Datei hochladen</option>
                                </select>
                            </div>

                            {submissionData.type === 'LINK' ? (
                                <div className="form-group">
                                    <label>URL *</label>
                                    <input
                                        type="url"
                                        value={submissionData.url}
                                        onChange={(e) => setSubmissionData(prev => ({
                                            ...prev,
                                            url: e.target.value
                                        }))}
                                        placeholder="https://..."
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Datei *</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setSubmissionData(prev => ({
                                            ...prev,
                                            file: e.target.files?.[0] || undefined
                                        }))}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
                                        required
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => setShowSubmissionForm(false)}
                                className="cancel-btn"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSubmissionSubmit}
                                disabled={isSubmitting || !submissionData.title.trim()}
                                className="submit-btn"
                            >
                                {isSubmitting ? '⏳ Wird eingereicht...' : '📤 Einreichen'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grading Modal */}
            {showGradingModal && (
                <div className="modal-overlay" onClick={() => setShowGradingModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📝 Abgabe bewerten</h3>
                            <button
                                onClick={() => setShowGradingModal(false)}
                                className="modal-close"
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Note (0-100) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={gradingData.grade}
                                    onChange={(e) => setGradingData(prev => ({
                                        ...prev,
                                        grade: parseInt(e.target.value) || 0
                                    }))}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Feedback</label>
                                <textarea
                                    value={gradingData.feedback}
                                    onChange={(e) => setGradingData(prev => ({
                                        ...prev,
                                        feedback: e.target.value
                                    }))}
                                    placeholder="Feedback für den Studenten"
                                    rows={4}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button
                                onClick={() => setShowGradingModal(false)}
                                className="cancel-btn"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleGradeSubmission}
                                className="submit-btn"
                            >
                                💾 Bewertung speichern
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmissionPool;