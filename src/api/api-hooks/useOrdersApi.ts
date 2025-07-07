import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ordersApi from "../api/orders";
import { ApiResponse } from "../api-service/types.api";
import { OrderStatus, Order } from "../../pages/orders/types.orders";

/**
 * Orders list params
 */
export interface OrdersListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

/**
 * Order status update params
 */
export interface OrderStatusUpdateParams {
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
}

/**
 * Order cancellation params
 */
export interface OrderCancellationParams {
  orderId: string;
  cancellationReason?: string;
}

/**
 * Custom hook for getting order by ID
 */
export const useGetOrderByIdApi = (orderId: string) => {
  return useQuery({
    queryKey: ["getOrderById", orderId],
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data?.data?.response as Order,
  });
};

/**
 * Custom hook for getting seller orders
 */
export const useGetOrdersApi = (params: OrdersListParams = {}) => {
  return useQuery({
    queryKey: ["getSellerOrders", params],
    queryFn: () => ordersApi.getOrders(params),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => data?.data?.response as ApiResponse & { docs: Order[] },
  });
};

/**
 * Custom hook for updating order status
 */
export const useUpdateOrderStatusApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, ...data }: OrderStatusUpdateParams) => 
      ordersApi.updateOrderStatus(orderId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch orders data
      queryClient.invalidateQueries({ queryKey: ["getSellerOrders"] });
      queryClient.invalidateQueries({ queryKey: ["getOrderById", variables.orderId] });
    },
  });
};

// /**
//  * Custom hook for cancelling order
//  */
// export const useCancelOrderApi = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: ({ orderId, ...data }: OrderCancellationParams) => 
//       ordersApi.cancelOrder(orderId, data),
//     onSuccess: (_, variables) => {
//       // Invalidate and refetch orders data
//       queryClient.invalidateQueries({ queryKey: ["getSellerOrders"] });
//       queryClient.invalidateQueries({ queryKey: ["getOrderById", variables.orderId] });
//     },
//   });
// };