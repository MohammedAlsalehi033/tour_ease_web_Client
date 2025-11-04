// src/app/services/apiService.ts
import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path as needed
import { auth } from '@/lib/firebase';
import { getSession } from 'next-auth/react';

interface FetchOptions {
  method: string;
  headers: Record<string, string>;
  body?: string | FormData;
}

@injectable()
export class ApiService {
  readonly baseUrl: string = 'https://api.tourease.me/api';
  readonly baseUrl2: string = 'https://api.tourease.me/api';

  constructor() {

  }

   private async getAuthToken(): Promise<string | null> {

    if (typeof window === 'undefined') {
      try {
        const session = await getServerSession(authOptions);
        return (session?.user as any)?.firebaseToken || null;
      } catch (error) {
        console.error('Error getting server session:', error);
        return null;
      }
    } 
    
    else {
      try {
          const seestion = await getSession();
          console.log(seestion)
          return (seestion?.user as any)?.firebaseToken ?? ""
       
      } catch (error) {
        console.error('Error getting client-side Firebase token:', error);
        return null;
      }
    }
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
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
      console.log(`${this.baseUrl}${url}`, options);
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
  async post<T>(url: string, body: Record<string, any> | FormData = {}, isFormData: boolean = false): Promise<T> {
    let headers = await this.getHeaders();
    if(isFormData) {
      // Remove Content-Type header for FormData to let browser set it automatically with boundary
      delete headers['Content-Type'];
      console.log('Uploading file:', body);

    }
    const options: FetchOptions = {
      method: 'POST',
      headers: headers,
      body: isFormData ? body as FormData : JSON.stringify(body),
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