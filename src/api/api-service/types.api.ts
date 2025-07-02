export interface ApiResponse {
  docs: any[];
  hasNext: boolean;
  hasPrev: boolean;
  totalPages: number;
  currentPage: number;
  totalDocs: number;
}