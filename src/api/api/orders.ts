import { apiPaths } from "../api-service/apiPaths";
import ApiService from "../api-service/ApiService";

/**
 * Get order by ID
 */
export const getOrderById = (orderId: string) => {
    return ApiService({
        method: 'GET',
        endpoint: `${apiPaths.orders.getById}/${orderId}`,
    });
};

/**
 * Update order status
 */
export const updateOrderStatus = (orderId: string, data: {
    status: string;
    trackingNumber?: string;
    estimatedDeliveryDate?: string;
}) => {
    return ApiService({
        method: 'PUT',
        endpoint: `${apiPaths.orders.updateStatus}/${orderId}`,
        data,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

/**
 * Get all orders for seller with search and filters
 */
export const getOrders = (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.orders.getAll,
        params,
    });
};