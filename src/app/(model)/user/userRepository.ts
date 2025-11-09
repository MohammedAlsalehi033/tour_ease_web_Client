import { injectable } from 'tsyringe';
import { User, UserResponse, UsersResponse } from './userModel';
import { ApiService } from '@/app/services/apiService';

@injectable()
export class UserRepository {
  constructor(private apiService: ApiService) {}

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await this.apiService.get<UserResponse>(`/getUserById?id=${userId}`);
      
      if (!response.success) {
        throw new Error('Failed to fetch user');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUserRoles(userId: string, roles: string[]): Promise<User> {
    try {
      const response = await this.apiService.put<UserResponse>(`/updateUser`, {
        id: userId,
        roles
      });
      
      if (!response.success) {
        throw new Error('Failed to update user roles');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  }

  async updateUserProfilePicture(userId: string, mediaFile: File): Promise<any> {
    try {
      console.log(mediaFile.name)
      const formData = new FormData();
      formData.append('profilePicture', mediaFile);


      const response = await this.apiService.post<UserResponse>(`/profile-picture/${userId}`, formData , true);
      
      if (!response.success) {
              console.log(response)

        throw new Error('Failed to update profile picture');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw error;
    }
  }


}