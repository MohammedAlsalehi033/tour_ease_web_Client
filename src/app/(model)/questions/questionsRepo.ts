import { injectable } from "tsyringe";
import { Question } from "./questionsModel";
import { ApiService } from "@/app/services/apiService";
import { ResponseModel } from "@/Types/types";

@injectable()
export class QuestionsRepo {
    constructor(private apiService: ApiService) {}

    async getAllQuestions(page: number = 1, limit: number = 10): Promise<Question[]> {
        const response = await this.apiService.get<ResponseModel<Question>>(`/questions?page=${page}&limit=${limit}`);
        return response.data;
    }

    async getQuestion(id: string): Promise<Question> {
        const response = await this.apiService.get<ResponseModel<Question>>(`/questions/${id}`);
        return response.data;
    }

    async voteQuestion(id: number, userId: string, isUpVote: boolean): Promise<Question> {
        const response = await this.apiService.post<ResponseModel<Question>>(`/questions/vote`, {
            id,
            userId,
            isUpVote,
        });
        return response.data;
    }


    async addQuestion (question: Question): Promise<Question> {
        const response = await this.apiService.post<ResponseModel<Question>>(`/questions`, question);
        console.log(response.data);
        return response.data[0];
    }
    async askAI(question: Question): Promise<Question> {

        const response = await this.apiService.post<ResponseModel<Question>>(`/questions/ai`, { title: question.title, description: question.description });
        console.log(response.data);
        return response.data;
    }
    
}