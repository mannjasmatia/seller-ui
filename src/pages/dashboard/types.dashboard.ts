export interface Product {
  id: string;
  name: string;
}

export interface FilterState {
  selectedProducts: string[];
  timeGranularity: string;
  customFromDate: string;
  customToDate: string;
}