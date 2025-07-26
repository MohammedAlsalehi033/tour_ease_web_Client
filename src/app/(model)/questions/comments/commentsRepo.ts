import { injectable } from "tsyringe";
import { Comment } from "./commentsModel";
import { ApiService } from "@/app/services/apiService";
import { ResponseModel } from "@/Types/types";

@injectable()
export class CommentsRepo {
    constructor(private apiService: ApiService) {}

    async getComments(questionId: string): Promise<Comment[]> {
        const response = await this.apiService.get<ResponseModel<Comment>>(`/commments?id=${questionId}`);
        return response.data;
    }

    async createComment(comment: Comment): Promise<Comment> {
        console.log(comment);
        const response = await this.apiService.post<ResponseModel<Comment>>(`/commments`, {
            userId: comment.userId,
            questionId: comment.questionId,
            content: comment.content,
        });
        return response.data;
    }
    
}