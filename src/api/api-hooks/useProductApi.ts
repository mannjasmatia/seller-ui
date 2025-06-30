// src/api/api-hooks/useProductsApi.ts
import { useQuery } from '@tanstack/react-query';
import * as productApi from '../api/products';
import { ProductsQueryParams, ProductsResponse } from '../../pages/products/types.products';

export const useProductsApi = (params: ProductsQueryParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data: any) => data?.data?.response as ProductsResponse,
  });
};