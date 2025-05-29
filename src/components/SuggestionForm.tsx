import React, { useState } from 'react';
import { SuggestionPriority } from '../types/Suggestion';

interface SuggestionFormProps {
    onSubmit: (content: string, priority: SuggestionPriority) => void;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({ onSubmit }) => {
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState<SuggestionPriority>('less_important');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content, priority);
            setContent('');
        }
    };

    return (
        <div className="suggestion-form">
            <h2>Надіслати пропозицію</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="content">Ваша пропозиція:</label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={4}
                        placeholder="Напишіть вашу пропозицію тут..."
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="priority">Пріоритет:</label>
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as SuggestionPriority)}
                    >
                        <option value="urgent">Терміново - Потребує негайного вирішення</option>
                        <option value="less_important">Менш важливе</option>
                        <option value="very_important">Дуже важливе</option>
                    </select>
                </div>
                <button type="submit" className="submit-button">
                    Надіслати пропозицію
                </button>
            </form>
        </div>
    );
};

export default SuggestionForm; 