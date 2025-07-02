import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

/**
 * Get business types
 */
export const getBusinessTypes = () => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.businessType.all,
    });
};
