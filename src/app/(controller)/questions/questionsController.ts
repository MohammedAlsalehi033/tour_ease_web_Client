import { inject, injectable } from "tsyringe";
import { QuestionsRepo } from "@/app/(model)/questions/questionsRepo";
import { Question } from "@/app/(model)/questions/questionsModel";

@injectable()
export class QuestionsController {
    constructor(@inject(QuestionsRepo) private questionsRepo: QuestionsRepo) {}

    async getAllQuestions(): Promise<Question[]> {
        return this.questionsRepo.getAllQuestions();
    }

    async getQuestion(id: string): Promise<Question> {
        return this.questionsRepo.getQuestion(id);
    }

    async voteQuestion(id: number, userId: string, isUpVote: boolean): Promise<Question> {
        return this.questionsRepo.voteQuestion(id, userId, isUpVote);
    }

}