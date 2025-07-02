import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

/**
 * Get user profile
 */
export const getProfile = () => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.profile.get,
    });
};

/**
 * Update user profile
 */
export const updateProfile = (data: FormData | Record<string, any>) => {
    // Check if data is FormData (for file uploads) or regular object
    const isFormData = data instanceof FormData;
    
    return ApiService({
        method: 'PUT',
        endpoint: apiPaths.profile.update,
        data,
        headers: isFormData ? {
            // Don't set Content-Type for FormData, let the browser set it
        } : {
            'Content-Type': 'application/json',
        },
    });
};