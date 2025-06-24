// src/api/api/editProduct.ts
import { apiPaths } from "../api-service/apiPaths"
import ApiService from "../api-service/ApiService"

// Product Info APIs
export const updateProductInfo = (productId: string, data: any) => {
    return ApiService({
        method: 'PUT',
        endpoint: `${apiPaths.productInfo.update}/${productId}`,
        data
    })
}

export const getProductInfo = (productId: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.productInfo.get}/${productId}`,
    })
}

// Product Attributes APIs
export const syncProductAttributes = (productId: string, data: any) => {
    return ApiService({
        method: 'POST',
        endpoint: `${apiPaths.productAttributes.sync}/${productId}`,
        data
    })
}

export const getProductAttributes = (productId: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.productAttributes.get}/${productId}`,
    })
}

// Product Images APIs
export const syncProductImages = (productId: string, formData: FormData) => {
    return ApiService({
        method: 'POST',
        endpoint: `${apiPaths.productImages.sync}/${productId}`,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const getProductImages = (productId: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.productImages.get}/${productId}`,
    })
}

// Product Pricing APIs
export const syncProductPricing = (productId: string, data: any) => {
    return ApiService({
        method: 'POST',
        endpoint: `${apiPaths.productPricing.sync}/${productId}`,
        data
    })
}

export const getProductPricing = (productId: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.productPricing.get}/${productId}`,
    })
}

// Product Variations APIs
export const syncProductVariations = (productId: string, data: any) => {
    return ApiService({
        method: 'POST',
        endpoint: `${apiPaths.productVariations.sync}/${productId}`,
        data
    })
}

export const getProductVariations = (productId: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.productVariations.get}/${productId}`,
    })
}

// Product Services APIs
export const syncProductServices = (productId: string, data: any) => {
    return ApiService({
        method: 'POST',
        endpoint: `${apiPaths.productServices.sync}/${productId}`,
        data
    })
}

export const getProductServices = (productId: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.productServices.get}/${productId}`,
    })
}

// Product Description APIs
export const syncProductDescription = (productId: string, data: any) => {
    return ApiService({
        method: 'POST',
        endpoint: `${apiPaths.productDescription.sync}/${productId}`,
        data
    })
}

export const syncProductDescriptionImages = (productId: string, formData: FormData) => {
    return ApiService({
        method: 'POST',
        endpoint: `${apiPaths.productDescription.syncImages}/${productId}/images`,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export const getProductDescription = (productId: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.productDescription.get}/${productId}`,
    })
}

// Categories API (for dropdown)
export const getCategories = () => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.category.all,
    })
}