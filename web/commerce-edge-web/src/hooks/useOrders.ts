import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import type { CheckoutData } from '@/models';

export function useOrders(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderService.getOrders(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckoutData) => orderService.createOrder(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      return order;
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useShippingMethods() {
  return useQuery({
    queryKey: ['shippingMethods'],
    queryFn: () => orderService.getShippingMethods(),
  });
}

export function useTrackOrder(trackingNumber: string) {
  return useQuery({
    queryKey: ['order', 'track', trackingNumber],
    queryFn: () => orderService.trackOrder(trackingNumber),
    enabled: !!trackingNumber,
  });
}