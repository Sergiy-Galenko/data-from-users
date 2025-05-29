export type SuggestionPriority = 'urgent' | 'less_important' | 'very_important';

export interface Suggestion {
    id: string;
    userId: string;
    content: string;
    priority: SuggestionPriority;
    createdAt: Date;
    status: 'pending' | 'in_progress' | 'resolved';
} 