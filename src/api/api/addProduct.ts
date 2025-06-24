// src/api/api/addProduct.ts
import { apiPaths } from "../api-service/apiPaths"
import ApiService from "../api-service/ApiService"

// Create Product API
export const createProduct = (data: any) => {
    return ApiService({
        method: 'POST',
        endpoint: apiPaths.productInfo.create,
        data
    })
}

// Categories API (for dropdown)
export const getCategories = () => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.category.all,
    })
}