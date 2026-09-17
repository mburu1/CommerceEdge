import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart.service';

const CART_KEY = ['cart'];

export function useCart() {
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => cartService.getCart(),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity, variantId }: { productId: string; quantity: number; variantId?: string }) =>
      cartService.addItem(productId, quantity, variantId),
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.updateItem(itemId, quantity),
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });
}

export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => cartService.applyCoupon(code),
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });
}