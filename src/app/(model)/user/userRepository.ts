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

  async getAllUsers(page: number = 1, pageSize: number = 10): Promise<UsersResponse> {
    try {
      const response = await this.apiService.get<UsersResponse>(
        `/getUsers?page=${page}&limit=${pageSize}`
      );
      
      if (!response.success) {
        throw new Error('Failed to fetch users');
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'blocked'): Promise<User> {
    try {
      const response = await this.apiService.put<UserResponse>(`/updateUser`, {
        id: userId,
        accountStatus: status
      });
      
      if (!response.success) {
        throw new Error('Failed to update user status');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
}