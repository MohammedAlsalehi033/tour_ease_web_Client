export interface Question {
    id: number;
    userId: string;
    title: string;
    description: string;
    upvotes: number;
    downvotes: number;
    updatedAt: string;
    createdAt: string;
    tags: string[];
    user: {
        id: string;
        username: string;
        mediaUrls: string[];
    };
    vote: Array<{
        userId: string;
        type: 'UPVOTE' | 'DOWNVOTE';
    }>;
    _count: {
        comments: number;
    };
}