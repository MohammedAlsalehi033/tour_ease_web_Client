import { injectable } from "tsyringe";
import { Chat, ChatMessage } from './chatModel';
import { ApiService } from "@/app/services/apiService";
import { ResponseModel } from "@/Types/types";

@injectable()
export class ChatRepo {
    constructor(private apiService: ApiService) {}

    async fetchChats(userId: string): Promise<Chat[]> {
        try {
            const response = await this.apiService.get<ResponseModel<Chat>>(`/chats/${userId}`);
            return response.data;
        }catch (error) {
            console.error('Error fetching chats:', error);
            throw error;
        }
    }

    async fetchMessages(senderid: string, partnerId: string): Promise<ChatMessage[]> {
        try {
            const response = await this.apiService.get<ResponseModel<ChatMessage>>(`/messages?senderId=${senderid}&receiverId=${partnerId}`);
            return response.data;
        } catch (error){
            throw error ;
        }
    }

    async sendMessage(message: ChatMessage): Promise<ResponseModel<ChatMessage>> {
        try {
            const response = await this.apiService.post<ResponseModel<ChatMessage>>('/messages', message);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}