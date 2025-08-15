// src/app/services/apiService.ts
import { injectable } from 'tsyringe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed

interface FetchOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

@injectable()
export class ApiService {
  readonly baseUrl2: string = 'http://13.201.19.41:3003/api';
  readonly baseUrl: string = 'http://localhost:3000/api';


  constructor() {
    // Constructor should be synchronous - we'll get session in methods instead
  }

  // Helper method to get Firebase token from session (server-side)
  private async getServerAuthToken(): Promise<string | null> {
    try {
      const session = await getServerSession(authOptions);
      return session?.user?.firebaseToken || null;
    } catch (error) {
      console.error('Error getting server session:', error);
      return null;
    }
  }

  // Helper method to get token from localStorage (client-side)
  private  getClientAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // Get appropriate auth token based on environment
  private async getAuthToken(): Promise<string | null> {
    // Check if we're on server or client
    if (typeof window === 'undefined') {
      // Server-side: get from NextAuth session
      return await this.getServerAuthToken();
    } else {
      // Client-side: get from localStorage
      return this.getClientAuthToken();
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
  

    const token = await this.getAuthToken();
    let headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic fetch method with error handling
  private async fetchWithErrorHandling<T>(
    url: string,
    options: FetchOptions
  ): Promise<T> {
    try {
      console.log(`${this.baseUrl}${url}`);
      const response = await fetch(`${this.baseUrl}${url}`, options);
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API request failed with status: ${JSON.stringify(response)}`
        );
      }

      // Parse response JSON
      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // GET request method
  async get<T>(url: string): Promise<T> {
    const options: FetchOptions = {
      method: 'GET',
      headers: await this.getHeaders(),
    };

    return this.fetchWithErrorHandling<T>(url, options);
  }

  // POST request method
  async post<T>(url: string, body: Record<string, any> = {}, isFormData: boolean = false): Promise<T> {
    const options: FetchOptions = {
      method: 'POST',
      headers: await this.getHeaders(),
      body: isFormData ? body : JSON.stringify(body),
    };

    return this.fetchWithErrorHandling<T>(url, options);
  }

  // PUT request method
  async put<T>(url: string, body: Record<string, any> = {}): Promise<T> {
    const options: FetchOptions = {
      method: 'PUT',
      headers: await this.getHeaders(),
      body: JSON.stringify(body),
    };

    return this.fetchWithErrorHandling<T>(url, options);
  }

  // PATCH request method
  async patch<T>(url: string, body: Record<string, any> = {}): Promise<T> {
    const options: FetchOptions = {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify(body),
    };

    return this.fetchWithErrorHandling<T>(url, options);
  }

  // DELETE request method
  async delete<T>(url: string): Promise<T> {
    const options: FetchOptions = {
      method: 'DELETE',
      headers: await this.getHeaders(),
    };

    return this.fetchWithErrorHandling<T>(url, options);
  }
}