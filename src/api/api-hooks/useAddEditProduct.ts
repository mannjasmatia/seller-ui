// src/api/api-hooks/useProductApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as productApi from '../api/addEditProduct';

// Product Info Hooks
export const useCreateProductApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: any) => productApi.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
};

export const useUpdateProductInfoApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            productApi.updateProductInfo(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
        }
    });
};

export const useGetProductInfoApi = (productId: string) => {
    return useQuery({
        queryKey: ['product', productId, 'info'],
        queryFn: () => productApi.getProductInfo(productId),
        enabled: !!productId
    });
};

// Product Attributes Hooks
export const useSyncProductAttributesApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            productApi.syncProductAttributes(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'attributes'] });
        }
    });
};

export const useGetProductAttributesApi = (productId: string) => {
    return useQuery({
        queryKey: ['product', productId, 'attributes'],
        queryFn: () => productApi.getProductAttributes(productId),
        enabled: !!productId
    });
};

// Product Images Hooks
export const useSyncProductImagesApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, formData }: { productId: string; formData: FormData }) =>
            productApi.syncProductImages(productId, formData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'images'] });
        }
    });
};

export const useGetProductImagesApi = (productId: string) => {
    return useQuery({
        queryKey: ['product', productId, 'images'],
        queryFn: () => productApi.getProductImages(productId),
        enabled: !!productId
    });
};

// Product Pricing Hooks
export const useSyncProductPricingApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            productApi.syncProductPricing(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'pricing'] });
        }
    });
};

export const useGetProductPricingApi = (productId: string) => {
    return useQuery({
        queryKey: ['product', productId, 'pricing'],
        queryFn: () => productApi.getProductPricing(productId),
        enabled: !!productId
    });
};

// Product Variations Hooks
export const useSyncProductVariationsApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            productApi.syncProductVariations(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'variations'] });
        }
    });
};

export const useGetProductVariationsApi = (productId: string) => {
    return useQuery({
        queryKey: ['product', productId, 'variations'],
        queryFn: () => productApi.getProductVariations(productId),
        enabled: !!productId
    });
};

// Product Services Hooks
export const useSyncProductServicesApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            productApi.syncProductServices(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'services'] });
        }
    });
};

export const useGetProductServicesApi = (productId: string) => {
    return useQuery({
        queryKey: ['product', productId, 'services'],
        queryFn: () => productApi.getProductServices(productId),
        enabled: !!productId
    });
};

// Product Description Hooks
export const useSyncProductDescriptionApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            productApi.syncProductDescription(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'description'] });
        }
    });
};

export const useSyncProductDescriptionImagesApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, formData }: { productId: string; formData: FormData }) =>
            productApi.syncProductDescriptionImages(productId, formData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'description'] });
        }
    });
};

export const useGetProductDescriptionApi = (productId: string) => {
    return useQuery({
        queryKey: ['product', productId, 'description'],
        queryFn: () => productApi.getProductDescription(productId),
        enabled: !!productId
    });
};

// Categories Hook
export const useGetCategoriesApi = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => productApi.getCategories(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (data:any) => {
            return data?.data?.response
        }
    });
};