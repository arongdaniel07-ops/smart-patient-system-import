import { ApiResponse } from '../types';

const RAW_API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_API_URL 
  ? (RAW_API_URL.endsWith('/api') ? RAW_API_URL : `${RAW_API_URL.replace(/\/$/, '')}/api`) 
  : '/api';


export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getToken(): string | null {
  return localStorage.getItem('smart_patient_token');
}

export function setToken(token: string): void {
  localStorage.setItem('smart_patient_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('smart_patient_token');
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return {} as T;
  }

  // Handle binary download responses
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('application/pdf') || contentType.includes('image/') || contentType.includes('application/octet-stream'))) {
    if (!response.ok) {
      throw new ApiError('Failed to download file', response.status);
    }
    const blob = await response.blob();
    return blob as unknown as T;
  }

  let body: any;
  try {
    body = await response.json();
  } catch (err) {
    body = null;
  }

  if (!response.ok) {
    const errorMsg = body?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, body);
  }

  const apiResponse = body as ApiResponse<T>;
  return apiResponse.data !== undefined ? apiResponse.data : (body as T);
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body?: any) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

export const apiClient = api;

