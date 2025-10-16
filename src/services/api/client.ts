import { tokenAtom } from '@/store';
import { getDefaultStore } from 'jotai';

const store = getDefaultStore();

interface ApiClientConfig {
  baseURL: string;
  version: string;
  timeout: number;
}

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public error: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseURL: string;
  private version: string;
  private timeout: number;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.version = config.version;
    this.timeout = config.timeout;
  }

  private getHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    const token = store.get(tokenAtom);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private getRequestURL(endpoint: string): string {
    return `${this.baseURL}/${this.version}/${endpoint.replace(/^\//, '')}`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiErrorResponse = await response.json();
      throw new ApiError(response.status, error.message, error.error);
    }

    return response.json();
  }

  async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, signal } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.getRequestURL(endpoint), {
        method,
        headers: {
          ...Object.fromEntries(this.getHeaders()),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'Request timeout', 'TIMEOUT');
        }
        throw new ApiError(500, error.message, 'NETWORK_ERROR');
      }
      throw error;
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown, config?: Omit<ApiRequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T>(endpoint: string, body: unknown, config?: Omit<ApiRequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body: unknown, config?: Omit<ApiRequestConfig, 'method'>) {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Create and export default instance
export const api = new ApiClient({
  baseURL: 'https://api.tumblr.com',
  version: import.meta.env.VITE_API_VERSION || 'v2',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
});



