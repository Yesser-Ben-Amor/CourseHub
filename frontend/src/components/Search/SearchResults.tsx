import React from 'react';
import './SearchResults.css';

interface SearchResultsProps {
  results: any[];
  isLoading: boolean;
  filter: string;
  onReset?: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, isLoading, filter, onReset }) => {
  if (isLoading) {
    return <div className="search-loading">Suche läuft...</div>;
  }

  if (results.length === 0) {
    return <div className="search-no-results">Keine Ergebnisse gefunden.</div>;
  }

  // Gruppiere Ergebnisse nach Typ
  const studentResults = results.filter(item => item.type === 'student');
  const teacherResults = results.filter(item => item.type === 'teacher');
  const bookResults = results.filter(item => item.type === 'book');
  const courseResults = results.filter(item => item.type === 'course');

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <div>
          <h3 className="search-results-title">Suchergebnisse</h3>
          <p className="search-results-count">{results.length} Ergebnisse gefunden</p>
        </div>
        {typeof onReset === 'function' && (
          <button 
            className="search-reset-button" 
            onClick={() => onReset()}
          >
            ← Zurück zur Übersicht
          </button>
        )}
      </div>

      {studentResults.length > 0 && (
        <div className="search-results-section">
          <h4 className="search-results-section-title">
            <i className="fas fa-user-graduate"></i> Studenten ({studentResults.length})
          </h4>
          <div className="search-results-grid">
            {studentResults.map((student) => (
              <div key={`student-${student.id}`} className="search-result-card student-card">
                <div className="search-result-header">
                  <span className="search-result-icon">👤</span>
                  <h5 className="search-result-title">{student.username}</h5>
                </div>
                <div className="search-result-details">
                  <p><strong>ID:</strong> {student.id}</p>
                  <p><strong>E-Mail:</strong> {student.email}</p>
                  {student.createdAt && <p><strong>Erstellt am:</strong> {new Date(student.createdAt).toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teacherResults.length > 0 && (
        <div className="search-results-section">
          <h4 className="search-results-section-title">
            <i className="fas fa-chalkboard-teacher"></i> Dozenten ({teacherResults.length})
          </h4>
          <div className="search-results-grid">
            {teacherResults.map((teacher) => (
              <div key={`teacher-${teacher.id}`} className="search-result-card teacher-card">
                <div className="search-result-header">
                  <span className="search-result-icon">👨‍🏫</span>
                  <h5 className="search-result-title">{teacher.firstName} {teacher.lastName}</h5>
                </div>
                <div className="search-result-details">
                  <p><strong>ID:</strong> {teacher.id}</p>
                  <p><strong>Fach:</strong> {teacher.subject}</p>
                  {teacher.birthDate && <p><strong>Geburtsdatum:</strong> {new Date(teacher.birthDate).toLocaleDateString()}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookResults.length > 0 && (
        <div className="search-results-section">
          <h4 className="search-results-section-title">
            <i className="fas fa-book"></i> Bücher ({bookResults.length})
          </h4>
          <div className="search-results-grid">
            {bookResults.map((book) => (
              <div key={`book-${book.id}`} className="search-result-card book-card">
                <div className="search-result-header">
                  <span className="search-result-icon">{book.icon || '📚'}</span>
                  <h5 className="search-result-title">{book.title}</h5>
                </div>
                <div className="search-result-details">
                  <p><strong>ID:</strong> {book.id}</p>
                  <p><strong>Autor:</strong> {book.author}</p>
                  {book.description && <p><strong>Beschreibung:</strong> {book.description.substring(0, 100)}...</p>}
                  {book.courseId && <p><strong>Kurs-ID:</strong> {book.courseId}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {courseResults.length > 0 && (
        <div className="search-results-section">
          <h4 className="search-results-section-title">
            <i className="fas fa-graduation-cap"></i> Kurse ({courseResults.length})
          </h4>
          <div className="search-results-grid">
            {courseResults.map((course) => (
              <div key={`course-${course.id}`} className="search-result-card course-card">
                <div className="search-result-header">
                  <span className="search-result-icon">🎓</span>
                  <h5 className="search-result-title">{course.name}</h5>
                </div>
                <div className="search-result-details">
                  <p><strong>ID:</strong> {course.id}</p>
                  {course.description && <p><strong>Beschreibung:</strong> {course.description.substring(0, 100)}...</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;