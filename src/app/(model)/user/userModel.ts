export interface User {
  id: string;
  username: string;
  email: string;
  accountStatus: 'active' | 'suspended' | 'blocked';
  mediaUrls: string[];
  createdAt: string;
  updatedAt: string;
  roles: string[];
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}