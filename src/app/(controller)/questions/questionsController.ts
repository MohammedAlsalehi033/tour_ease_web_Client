import { inject, injectable } from "tsyringe";
import { QuestionsRepo } from "@/app/(model)/questions/questionsRepo";
import { Question } from "@/app/(model)/questions/questionsModel";

@injectable()
export class QuestionsController {
    constructor(@inject(QuestionsRepo) private questionsRepo: QuestionsRepo) {}

    async addQuestion(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<Question> {
        try {
            console.log("Adding question:", question);
            return await this.questionsRepo.addQuestion(question);
        } catch (error) {
            throw new Error(`Failed to add question: ${(error as Error).message}`);
        }
    }

    async getAllQuestions(): Promise<Question[]> {
        try {
            return await this.questionsRepo.getAllQuestions();
        } catch (error) {
            throw new Error(`Failed to get all questions: ${(error as Error).message}`);
        }
    }

    async getQuestion(id: string): Promise<Question> {
        try {
            return await this.questionsRepo.getQuestion(id);
        } catch (error) {
            throw new Error(`Failed to get question with id ${id}: ${(error as Error).message}`);
        }
    }

    async voteQuestion(id: number, userId: string, isUpVote: boolean): Promise<Question> {
        try {
            return await this.questionsRepo.voteQuestion(id, userId, isUpVote);
        } catch (error) {
            throw new Error(`Failed to vote on question with id ${id}: ${(error as Error).message}`);
        }
    }


    async askAI(question: Question): Promise<string> {
        try {
            return await this.questionsRepo.askAI(question);
            
        } catch (error) {
            throw new Error(`Failed to ask AI: ${(error as Error).message}`);
        }
    }
}