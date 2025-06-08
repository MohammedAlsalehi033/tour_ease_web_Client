    export interface Chat {
        userId: string;
        partnerId: string;
        userName: string;
        lastMessage: string;
        timestamp: string; // ISO date string
        avatarUrl: string;
        isUnread: boolean;
        isOnline: boolean;
    }

    export interface ChatMessage {
        id: number;
        senderId: string;
        receiverId: string;
        content: string;
        sentAt: string;
    }
