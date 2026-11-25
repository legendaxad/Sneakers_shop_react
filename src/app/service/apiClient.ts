import axios, { AxiosError } from 'axios';
import { API_BASE_URL, Messages } from '../../lib/config';
import type { ApiErrorShape } from '../../lib/types/common';

/**
 * The single HTTP client shared by every service. Customer auth uses the
 * httpOnly `accessToken` cookie, so every request sends credentials.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

/** Normalised error used throughout the UI. */
export class ApiError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorShape>;
    const status = axiosError.response?.status ?? 0;
    const data = axiosError.response?.data;
    if (!axiosError.response) return new ApiError(Messages.networkError, 0);
    const message = typeof data === 'object' && data?.message ? data.message : `Request failed with status ${status}.`;
    return new ApiError(message, status, typeof data === 'object' ? data?.detail : undefined);
  }
  return new ApiError(Messages.unexpectedError, 0);
};

/** Human-readable message, including the backend detail (e.g. which product is out of stock). */
export const getApiErrorMessage = (error: unknown): string => {
  const apiError = toApiError(error);
  return apiError.detail ? `${apiError.message} (${apiError.detail})` : apiError.message;
};

/** Backend answers list endpoints with 404 "No data found!" when nothing matches. */
export const isNoData = (error: ApiError): boolean => error.status === 404 && error.message === Messages.noDataFound;

/* --------------------------- session expiry --------------------------- */

let unauthorizedHandler: (() => void) | null = null;

/**
 * Registers what happens when an authenticated call returns 401 (expired
 * cookie or blocked account). ContextProvider registers "clear the session".
 * Returns an unregister function for effect cleanup.
 */
export const setUnauthorizedHandler = (handler: () => void): (() => void) => {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) unauthorizedHandler = null;
  };
};

// Every error leaves the client as an ApiError; a 401 (except a failed login) ends the session.
api.interceptors.response.use(undefined, (error: unknown) => {
  const apiError = toApiError(error);
  const url = axios.isAxiosError(error) ? (error.config?.url ?? '') : '';
  if (apiError.status === 401 && !url.includes('/member/login')) unauthorizedHandler?.();
  return Promise.reject(apiError);
});
