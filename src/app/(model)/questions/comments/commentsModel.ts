// {
//     "id": 24,
//     "userId": "wsEkX50igfOLqzwmNRQp2AZFNdn1",
//     "questionId": 7,
//     "content": "yfufydhx",
//     "createdAt": "2025-05-21T17:47:27.328Z",
//     "user": {
//         "id": "wsEkX50igfOLqzwmNRQp2AZFNdn1",
//         "username": "wajahatalipk5@gmail.com",
//         "mediaUrls": []
//     }

import { User } from "../../user/userModel";

export interface Comment {
    id: number;
    userId: string;
    questionId: number;
    content: string;
    createdAt: string;
    user: User;
}
