import React, { useState } from 'react';
import { Suggestion, SuggestionPriority } from '../types/Suggestion';

interface SuggestionListProps {
    suggestions: Suggestion[];
    onStatusChange: (id: string, status: Suggestion['status']) => void;
}

const SuggestionList: React.FC<SuggestionListProps> = ({ suggestions, onStatusChange }) => {
    const [filter, setFilter] = useState<SuggestionPriority | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<Suggestion['status'] | 'all'>('all');

    const filteredSuggestions = suggestions.filter(suggestion => {
        const priorityMatch = filter === 'all' || suggestion.priority === filter;
        const statusMatch = statusFilter === 'all' || suggestion.status === statusFilter;
        return priorityMatch && statusMatch;
    });

    const getPriorityLabel = (priority: SuggestionPriority) => {
        switch (priority) {
            case 'urgent':
                return 'Терміново - Потребує негайного вирішення';
            case 'less_important':
                return 'Менш важливе';
            case 'very_important':
                return 'Дуже важливе';
        }
    };

    return (
        <div className="suggestion-list">
            <h2>Управління пропозиціями</h2>
            
            <div className="filters">
                <div className="filter-group">
                    <label>Фільтр за пріоритетом:</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as SuggestionPriority | 'all')}
                    >
                        <option value="all">Всі пріоритети</option>
                        <option value="urgent">Терміново</option>
                        <option value="less_important">Менш важливе</option>
                        <option value="very_important">Дуже важливе</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Фільтр за статусом:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as Suggestion['status'] | 'all')}
                    >
                        <option value="all">Всі статуси</option>
                        <option value="pending">В очікуванні</option>
                        <option value="in_progress">В процесі</option>
                        <option value="resolved">Вирішено</option>
                    </select>
                </div>
            </div>

            <div className="suggestions-grid">
                {filteredSuggestions.map(suggestion => (
                    <div key={suggestion.id} className="suggestion-card">
                        <div className="suggestion-header">
                            <span className={`priority-badge ${suggestion.priority}`}>
                                {getPriorityLabel(suggestion.priority)}
                            </span>
                            <span className={`status-badge ${suggestion.status}`}>
                                {suggestion.status === 'pending' ? 'В очікуванні' :
                                 suggestion.status === 'in_progress' ? 'В процесі' :
                                 'Вирішено'}
                            </span>
                        </div>
                        <p className="suggestion-content">{suggestion.content}</p>
                        <div className="suggestion-footer">
                            <span className="date">
                                {new Date(suggestion.createdAt).toLocaleDateString()}
                            </span>
                            <select
                                value={suggestion.status}
                                onChange={(e) => onStatusChange(suggestion.id, e.target.value as Suggestion['status'])}
                            >
                                <option value="pending">В очікуванні</option>
                                <option value="in_progress">В процесі</option>
                                <option value="resolved">Вирішено</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuggestionList; 