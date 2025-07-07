import { apiPaths } from "../api-service/apiPaths";

// Add these paths to your apiPaths.ts file:
// orders: {
//   getById: "api/v1/orders",
//   updateStatus: "api/v1/orders", 
//   sellerList: "api/v1/orders/seller/list",
//   cancel: "api/v1/orders",
// },
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
        endpoint: `${apiPaths.orders.updateStatus}/${orderId}/status`,
        data,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

/**
 * Get all orders for seller
 */
export const getOrders = (params: {
    page?: number;
    limit?: number;
    status?: string;
}) => {
    return ApiService({
        method: 'GET',
        endpoint: apiPaths.orders.getAll,
        params,
    });
};

// /**
//  * Cancel order
//  */
// export const cancelOrder = (orderId: string, data?: {
//     cancellationReason?: string;
// }) => {
//     return ApiService({
//         method: 'PUT',
//         endpoint: `${apiPaths.orders.cancel}/${orderId}/cancel`,
//         data,
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     });
// };