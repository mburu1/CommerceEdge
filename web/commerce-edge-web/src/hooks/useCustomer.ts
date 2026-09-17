import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '@/services/customer.service';
import type { Customer, Address, PaymentMethod, LoginCredentials, RegisterData, AuthResponse } from '@/models';

const CUSTOMER_KEY = ['customer'];

export function useCustomer() {
  return useQuery({
    queryKey: CUSTOMER_KEY,
    queryFn: () => customerService.getProfile(),
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => customerService.login(credentials),
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(CUSTOMER_KEY, data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => customerService.register(data),
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(CUSTOMER_KEY, data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => customerService.logout(),
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      queryClient.setQueryData(CUSTOMER_KEY, null);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Customer>) => customerService.updateProfile(data),
    onSuccess: (updatedCustomer) => {
      queryClient.setQueryData(CUSTOMER_KEY, updatedCustomer);
    },
  });
}

export function useAddresses() {
  return useQuery({
    queryKey: ['customer', 'addresses'],
    queryFn: () => customerService.getAddresses(),
  });
}

export function useAddress(id: string) {
  return useQuery({
    queryKey: ['customer', 'addresses', id],
    queryFn: () => customerService.getAddress(id),
    enabled: !!id,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (address: Omit<Address, 'id'>) => customerService.createAddress(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, address }: { id: string; address: Partial<Address> }) =>
      customerService.updateAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] });
    },
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['customer', 'paymentMethods'],
    queryFn: () => customerService.getPaymentMethods(),
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (method: Omit<PaymentMethod, 'id'>) => customerService.addPaymentMethod(method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'paymentMethods'] });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'paymentMethods'] });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.setDefaultPaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'paymentMethods'] });
    },
  });
}