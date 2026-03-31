export interface SearchParams {
  q?: string; // Текстовий запит (пошук по назві або автору)
  genre?: string;
  tag?: string;
  status?: string;
  page?: number;
  limit?: number;
}