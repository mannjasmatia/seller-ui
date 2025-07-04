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

export const useProductNamesApi = (params:any = {page:"1",limit:"20",search:""}) => {

  const {search, ...finalParams} = params; 

  if(params?.search){
      finalParams.search = params?.search
  }

  return useQuery({
    queryKey: ['productNames', params],
    queryFn: () => productApi.getProducts(finalParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    select: (data: any) => data?.data?.response as Partial<ProductsResponse>,
  });
};