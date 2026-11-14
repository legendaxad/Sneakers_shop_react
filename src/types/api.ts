/** Error body returned by the backend (`Errors` class serialised as JSON). */
export interface ApiErrorShape {
  code?: number;
  message?: string;
  detail?: string;
}
