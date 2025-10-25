import { injectable } from "tsyringe";
import { Question } from "./questionsModel";
import { ApiService } from "@/app/services/apiService";
import { ResponseModel } from "@/Types/types";
import EditQuestion from '../../(view)/questions/[Questionid]/EditQuestion';
import { promises } from "dns";

@injectable()
export class QuestionsRepo {
    constructor(private apiService: ApiService) {}

    async getAllQuestions(page: number = 1, limit: number = 10): Promise<Question[]> {
        const response = await this.apiService.get<ResponseModel<Question>>(`/questions?page=${page}&limit=${limit}`);
        return response.data as Question[];
    }

    async getQuestion(id: string): Promise<Question> {
        const response = await this.apiService.get<ResponseModel<Question>>(`/questions/${id}`);
        return response.data as Question;
    }

    async voteQuestion(id: number, userId: string, isUpVote: boolean): Promise<Question> {
        const response = await this.apiService.post<ResponseModel<Question>>(`/questions/vote`, {
            id,
            userId,
            isUpVote,
        });
        return response.data as Question;
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

    async editQuestion (question: Question): Promise<Question>{

        const response = await this.apiService.put<ResponseModel<Question>>(`/questions/${question.id}`, question);
        return response.data as Question;
    }

    async deleteQuestion (questionId : string): Promise<Question>{
        const response = await this.apiService.delete<ResponseModel<Question>>(`/questions/${questionId}`);
        return response.data as Question;
    }

    async searchQuestions(query: string, page: number = 1, limit: number = 10): Promise<Question[]> {
        const response = await this.apiService.get<ResponseModel<Question>>(`/questions/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
        return response.data as Question[];
    }

    async searchQuestionsByTag(tag: string, page: number = 1, limit: number = 10): Promise<Question[]> {
        const response = await this.apiService.get<ResponseModel<Question>>(`/questions/tag/${encodeURIComponent(tag)}?page=${page}&limit=${limit}`);
        return response.data as Question[];
    }

}