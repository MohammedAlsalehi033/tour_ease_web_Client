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

    async editQuestion(questionId: number, questionTitle: string, questionDescription: string): Promise<Question> {
        try {
            const question: Question = {
                id: questionId,
                title: questionTitle,
                description: questionDescription,
                userId: "",
                upvotes: 0,
                downvotes: 0,
                updatedAt: "",
                createdAt: "",
                tags: [],
                user: {
                    id: "",
                    username: "",
                    mediaUrls: []
                },
                vote: [],
                _count: {
                    comments: 0
                }
            };
            return await this.questionsRepo.editQuestion(question);
        } catch (error) {
            throw new Error(`Failed to edit question with id ${questionId}: ${(error as Error).message}`);
        }
    }

    async deleteQuestion (questionId : string){
        try {
            return await this.questionsRepo.deleteQuestion(questionId);
        } catch (error) {
            throw new Error (`failed to delete ${error}`)
        }
    }
    }