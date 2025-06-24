// src/api/api-hooks/useEditProductApi.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as editProductApi from '../api/editProduct';

// Product Info Hooks
export const useGetProductInfoApi = (productId: string) => {
    return useQuery({
        queryKey: ['product', productId, 'info'],
        queryFn: () => editProductApi.getProductInfo(productId),
        enabled: !!productId,
        select: (data: any) => data?.data?.response
    });
};

export const useUpdateProductInfoApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            editProductApi.updateProductInfo(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'info'] });
        }
    });
};

// Product Attributes Hooks
export const useGetProductAttributesApi = (productId: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['product', productId, 'attributes'],
        queryFn: () => editProductApi.getProductAttributes(productId),
        enabled: !!productId && enabled,
        select: (data: any) => data?.data?.response
    });
};

export const useSyncProductAttributesApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            editProductApi.syncProductAttributes(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'attributes'] });
        }
    });
};

// Product Images Hooks
export const useGetProductImagesApi = (productId: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['product', productId, 'images'],
        queryFn: () => editProductApi.getProductImages(productId),
        enabled: !!productId && enabled,
        select: (data: any) => data?.data?.response
    });
};

export const useSyncProductImagesApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, formData }: { productId: string; formData: FormData }) =>
            editProductApi.syncProductImages(productId, formData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'images'] });
        }
    });
};

// Product Pricing Hooks
export const useGetProductPricingApi = (productId: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['product', productId, 'pricing'],
        queryFn: () => editProductApi.getProductPricing(productId),
        enabled: !!productId && enabled,
        select: (data: any) => data?.data?.response
    });
};

export const useSyncProductPricingApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            editProductApi.syncProductPricing(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'pricing'] });
        }
    });
};

// Product Variations Hooks
export const useGetProductVariationsApi = (productId: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['product', productId, 'variations'],
        queryFn: () => editProductApi.getProductVariations(productId),
        enabled: !!productId && enabled,
        select: (data: any) => data?.data?.response
    });
};

export const useSyncProductVariationsApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            editProductApi.syncProductVariations(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'variations'] });
        }
    });
};

// Product Services Hooks
export const useGetProductServicesApi = (productId: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['product', productId, 'services'],
        queryFn: () => editProductApi.getProductServices(productId),
        enabled: !!productId && enabled,
        select: (data: any) => data?.data?.response
    });
};

export const useSyncProductServicesApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            editProductApi.syncProductServices(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'services'] });
        }
    });
};

// Product Description Hooks
export const useGetProductDescriptionApi = (productId: string, enabled: boolean = false) => {
    return useQuery({
        queryKey: ['product', productId, 'description'],
        queryFn: () => editProductApi.getProductDescription(productId),
        enabled: !!productId && enabled,
        select: (data: any) => data?.data?.response
    });
};

export const useSyncProductDescriptionApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            editProductApi.syncProductDescription(productId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'description'] });
        }
    });
};

export const useSyncProductDescriptionImagesApi = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ productId, formData }: { productId: string; formData: FormData }) =>
            editProductApi.syncProductDescriptionImages(productId, formData),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.productId, 'description'] });
        }
    });
};

// Categories Hook
export const useGetCategoriesApi = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => editProductApi.getCategories(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        select: (data: any) => {
            return data?.data?.response
        }
    });
};