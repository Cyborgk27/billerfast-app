export type Presentation = 'Box' | 'Unit';

export interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string | null;
  data: T;
  errors: string[] | null;
}