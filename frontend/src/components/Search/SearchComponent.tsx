import React, { useState, forwardRef, useImperativeHandle } from 'react';
import './SearchComponent.css';

// Definiere die möglichen Suchfilter basierend auf Datenbank-Attributen
type FilterOption = 'name' | 'id' | 'email' | 'date' | 'subject' | 'title' | 'author' | 'all';

// Definiere die Schnittstelle für die Ref
export interface SearchComponentHandle {
    resetSearch: () => void;
}

interface SearchComponentProps {
    onSearch: (query: string, filter: FilterOption) => void;
}

const SearchComponent = forwardRef<SearchComponentHandle, SearchComponentProps>(({ onSearch }, ref) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');

    // Stellt die resetSearch-Methode über die Ref zur Verfügung
    useImperativeHandle(ref, () => ({
        resetSearch: () => {
            setSearchQuery('');
            setSelectedFilter('all');
        }
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery, selectedFilter);
        }
    };

    return (
        <div className="search-container">
            <form onSubmit={handleSubmit} className="search-form">
                <div className="search-input-group">
                    <input
                        type="text"
                        placeholder="Suchen..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={selectedFilter}
                        onChange={(e) => setSelectedFilter(e.target.value as FilterOption)}
                        className="search-filter"
                    >
                        <option value="all">Alle Felder</option>
                        <option value="name">Name</option>
                        <option value="id">ID</option>
                        <option value="email">E-Mail</option>
                        <option value="date">Datum</option>
                        <option value="subject">Fach</option>
                        <option value="title">Titel</option>
                        <option value="author">Autor</option>
                    </select>
                    <button type="submit" className="search-button">
                        🔍
                    </button>
                </div>
            </form>
        </div>
    );
});

export default SearchComponent;