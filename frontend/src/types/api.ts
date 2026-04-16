export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface RequestOptions<TBody> {
  method: HttpMethod;
  body?: TBody;
  headers?: HeadersInit;
  cacheTag?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
}