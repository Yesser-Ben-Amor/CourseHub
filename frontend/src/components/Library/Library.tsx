import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Library.css';

interface Book {
    id: number;
    title: string;
    author: string;
    description: string;
    courseId: number;
    icon: string;
}

const Library: React.FC = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/api/books');
            setBooks(response.data);
            setError(null);
        } catch (err) {
            console.error('Fehler beim Laden der Bücher:', err);
            setError('Bücher konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (book: Book) => {
        window.open(`http://localhost:8080/api/books/${book.id}/download`, '_blank');
    };

    const handleBookClick = (book: Book) => {
        setSelectedBook(book);
    };

    const closeBookDetails = () => {
        setSelectedBook(null);
    };

    if (loading) {
        return <div className="library-loading">Bücher werden geladen...</div>;
    }

    if (error) {
        return <div className="library-error">{error}</div>;
    }

    return (
        <div className="library-container">
            <div className="library-header">
                <button 
                    className="library-back-btn" 
                    onClick={() => navigate('/campus')}
                >
                    &larr; Zurück zum Campus
                </button>
                <h1 className="library-title">Bibliothek</h1>
            </div>
            <p className="library-subtitle">Entdecken Sie unsere Sammlung an Büchern und Skripten</p>

            {books.length === 0 ? (
                <div className="library-empty">
                    <p>Keine Bücher verfügbar.</p>
                </div>
            ) : (
                <div className="library-grid">
                    {books.map(book => (
                        <div
                            key={book.id}
                            className="library-book-card"
                            onClick={() => handleBookClick(book)}
                        >
                            <div className="library-book-icon">{book.icon}</div>
                            <div className="library-book-info">
                                <h3 className="library-book-title">{book.title}</h3>
                                <p className="library-book-author">von {book.author}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedBook && (
                <div className="library-modal-overlay" onClick={closeBookDetails}>
                    <div className="library-modal" onClick={e => e.stopPropagation()}>
                        <div className="library-modal-header">
                            <h2>{selectedBook.title}</h2>
                            <button className="library-modal-close" onClick={closeBookDetails}>&times;</button>
                        </div>
                        <div className="library-modal-content">
                            <div className="library-book-details">
                                <div className="library-book-detail-icon">{selectedBook.icon}</div>
                                <div className="library-book-detail-info">
                                    <p><strong>Autor:</strong> {selectedBook.author}</p>
                                    <p><strong>Beschreibung:</strong> {selectedBook.description}</p>
                                </div>
                            </div>
                            <div className="library-modal-actions">
                                <button
                                    className="library-download-btn"
                                    onClick={() => handleDownload(selectedBook)}
                                >
                                    Herunterladen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Library;