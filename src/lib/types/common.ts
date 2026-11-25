/** Error body returned by the backend (`Errors` class serialised as JSON). */
export interface ApiErrorShape {
  code?: number;
  message?: string;
  detail?: string;
}

export type NoticeSeverity = 'success' | 'error' | 'info' | 'warning';

/** Request status for one block of server data, kept in local component state. */
export interface RequestState {
  loading: boolean;
  error: string | null;
}
