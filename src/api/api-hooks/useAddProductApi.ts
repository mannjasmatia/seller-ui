// src/api/api-hooks/useAddProductApi.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import * as addProductApi from '../api/addProduct';

export const useCreateProductApi = () => {
    return useMutation({
        mutationFn: (data: any) => addProductApi.createProduct(data)
    });
};

export const useGetCategoriesApi = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => addProductApi.getCategories(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (data: any) => {
            return data?.data?.response
        }
    });
};