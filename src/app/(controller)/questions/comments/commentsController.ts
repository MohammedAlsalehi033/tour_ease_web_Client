import { Comment } from "@/app/(model)/questions/comments/commentsModel";
import { CommentsRepo } from "@/app/(model)/questions/comments/commentsRepo";
import { inject, injectable } from "tsyringe";
@injectable()
export class CommentsController {
    constructor(@inject (CommentsRepo) private commentsRepo: CommentsRepo) {}

    async getComments(questionId: string): Promise<Comment[]> {
        return this.commentsRepo.getComments(questionId);
    }

    async createComment(comment: Comment): Promise<Comment> {
        return this.commentsRepo.createComment(comment);
    }
}