// src/app/services/apiService.ts
import { injectable } from 'tsyringe';

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
  }
  
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }
  
  // Helper method to prepare request headers
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getAuthToken();
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
      const response = await fetch(`${this.baseUrl}${url}`, options);
      
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API request failed with status: ${response.status}`
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
      headers: this.getHeaders(),
    };
    
    return this.fetchWithErrorHandling<T>(url, options);
  }
  
  // POST request method
  async post<T>(url: string, body: Record<string, any> = {}): Promise<T> {
    const options: FetchOptions = {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    };
    
    return this.fetchWithErrorHandling<T>(url, options);
  }
  
  // PUT request method
  async put<T>(url: string, body: Record<string, any> = {}): Promise<T> {
    const options: FetchOptions = {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    };
    
    return this.fetchWithErrorHandling<T>(url, options);
  }
  
  // PATCH request method
  async patch<T>(url: string, body: Record<string, any> = {}): Promise<T> {
    const options: FetchOptions = {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    };
    
    return this.fetchWithErrorHandling<T>(url, options);
  }
  
  // DELETE request method
  async delete<T>(url: string): Promise<T> {
    const options: FetchOptions = {
      method: 'DELETE',
      headers: this.getHeaders(),
    };
    
    return this.fetchWithErrorHandling<T>(url, options);
  }
}