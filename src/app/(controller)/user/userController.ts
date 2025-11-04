// src/app/controllers/userController.ts
import { injectable, inject } from 'tsyringe';
import { UserRepository } from '@/app/(model)/user/userRepository';
import { User, UsersResponse } from '@/app/(model)/user/userModel';

@injectable()
export class UserController {
  constructor(
    @inject(UserRepository) private userRepository: UserRepository
  ) {}


  async getUserById(id: string): Promise<User> {
    try {
      return await this.userRepository.getUserById(id);
    } catch (error: any) {
      console.error(`Error in UserController getUserById for ID ${id}:`, error.message);
      throw error; // Re-throwing for consistent error handling
    }
  }


  async updateUserRoles(id: string, roles: string[]): Promise<{ success: boolean; message?: string; data?: User }> {
    try {
      const user = await this.userRepository.updateUserRoles(id, roles);
      return {
        success: true,
        message: 'User roles updated successfully',
        data: user
      };
    } catch (error: any) {
      console.error(`Error in UserController updateUserRoles for ID ${id}:`, error.message);
      return {
        success: false,
        message: `Failed to update user roles: ${error.message}`
      };
    }
  }

  async updateUserProfilePicture(id: string, mediaFile: File): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
      const updatedUser = await this.userRepository.updateUserProfilePicture(id, mediaFile);
      return {
        success: true,
        message: 'Profile picture updated successfully',
        data: updatedUser
      };
    } catch (error: any) {
      console.error(`Error in UserController updateUserProfilePicture for ID ${id}:`, error.message);
      return {
        success: false,
        message: `Failed to update profile picture: ${error.message}`
      };
    }
  }
}