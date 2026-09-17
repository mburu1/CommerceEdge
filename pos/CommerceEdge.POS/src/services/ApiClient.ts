import { POSRequest, POSResponse, POSError } from '../requests/BaseTypes';

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
}

export class ApiClient {
  private config: Required<ApiClientConfig>;
  private interceptors: Array<(request: RequestInit) => RequestInit | Promise<RequestInit>> = [];
  private responseInterceptors: Array<(response: Response) => Response | Promise<Response>> = [];

  constructor(config: ApiClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? 30000,
      retries: config.retries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      headers: config.headers ?? {}
    };
  }

  addRequestInterceptor(interceptor: (request: RequestInit) => RequestInit | Promise<RequestInit>): void {
    this.interceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response | Promise<Response>): void {
    this.responseInterceptors.push(interceptor);
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<POSResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const requestId = this.generateRequestId();

    let requestInit: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...this.config.headers,
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    };

    for (const interceptor of this.interceptors) {
      requestInit = await interceptor(requestInit);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);
    requestInit.signal = controller.signal;

    let lastError: Error | null = null;
    const maxRetries = options.retries ?? this.config.retries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, requestInit);
        clearTimeout(timeoutId);

        let processedResponse = response;
        for (const interceptor of this.responseInterceptors) {
          processedResponse = await interceptor(processedResponse);
        }

        if (!processedResponse.ok) {
          const errorData = await processedResponse.json().catch(() => ({})) as { error?: POSError };
          throw new ApiError(
            processedResponse.status,
            errorData.error?.message || `HTTP ${processedResponse.status}`,
            errorData.error
          );
        }

        const data = await processedResponse.json();
        return data as POSResponse<T>;

      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error as Error;

        if (error instanceof ApiError) {
          if (error.status >= 400 && error.status < 500 && error.status !== 429) {
            throw error;
          }
        }

        if (attempt < maxRetries) {
          await this.sleep(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<POSResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<POSResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<POSResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<POSResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<POSResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  private generateRequestId(): string {
    return `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public error?: POSError
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}