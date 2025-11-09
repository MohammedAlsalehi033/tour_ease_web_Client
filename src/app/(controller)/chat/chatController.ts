import { inject, injectable } from 'tsyringe';
import { Chat, ChatMessage } from '../../(model)/chat/chatModel';
import { ChatRepo } from '../../(model)/chat/chatRepo';
@injectable()
export class ChatController {
    constructor(@inject(ChatRepo) private chatRepo: ChatRepo) {}



    async fetchChats(userId: string): Promise<Chat[]> {
        try {
            const chats = await this.chatRepo.fetchChats(userId);
            return chats;
        } catch (error) {
            console.error('Error fetching chats:', error);
            throw error;
        }
    }
    async fetchMessages(senderId: string, partnerId: string) {
        try {
            const messages = await this.chatRepo.fetchMessages(senderId, partnerId);
            return messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }
        async sendMessage(message: ChatMessage): Promise<ChatMessage> {
        try {
            const sentMessage = await this.chatRepo.sendMessage(message);
            return sentMessage;
        } catch (error) {
            throw error;
        }
    }
}




