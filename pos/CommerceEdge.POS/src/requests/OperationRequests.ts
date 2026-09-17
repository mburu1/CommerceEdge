import { POSRequest, POSResponse, PaginatedRequest, PaginatedResponse } from './BaseTypes';
import { Customer, CustomerSearchCriteria, CustomerSearchResult } from '../models/Customer';
import { Product, ProductSearchCriteria, ProductSearchResult, InventoryItem, StockMovement } from '../models/Product';
import { Order, OrderSearchCriteria, OrderSearchResult, Payment, PaymentMethod } from '../models/Order';
import { Receipt, ReceiptPrintOptions } from '../models/Receipt';
import { Shift, ShiftSearchCriteria, ShiftSearchResult, ShiftOpenRequest, ShiftCloseRequest } from '../models/Shift';
import { Register, RegisterSearchCriteria, RegisterSearchResult } from '../models/Register';
import { Employee, EmployeeSearchCriteria, EmployeeSearchResult, EmployeeAuthRequest, EmployeeAuthResponse } from '../models/Employee';

// Customer requests
export interface GetCustomerRequest extends POSRequest<{ customerId: string }> {}
export interface GetCustomerResponse extends POSResponse<Customer> {}

export interface SearchCustomersRequest extends POSRequest<CustomerSearchCriteria & PaginatedRequest> {}
export interface SearchCustomersResponse extends POSResponse<PaginatedResponse<CustomerSearchResult>> {}

export interface CreateCustomerRequest extends POSRequest<Omit<Customer, 'customerId' | 'createdAt' | 'updatedAt' | 'loyaltyPoints' | 'loyaltyTier'>> {}
export interface CreateCustomerResponse extends POSResponse<Customer> {}

export interface UpdateCustomerRequest extends POSRequest<Partial<Customer> & { customerId: string }> {}
export interface UpdateCustomerResponse extends POSResponse<Customer> {}

export interface DeleteCustomerRequest extends POSRequest<{ customerId: string }> {}
export interface DeleteCustomerResponse extends POSResponse<{ success: boolean }> {}

// Product requests
export interface GetProductRequest extends POSRequest<{ productId: string }> {}
export interface GetProductResponse extends POSResponse<Product> {}

export interface GetProductByBarcodeRequest extends POSRequest<{ barcode: string }> {}
export interface GetProductByBarcodeResponse extends POSResponse<Product> {}

export interface SearchProductsRequest extends POSRequest<ProductSearchCriteria & PaginatedRequest> {}
export interface SearchProductsResponse extends POSResponse<PaginatedResponse<ProductSearchResult>> {}

export interface CreateProductRequest extends POSRequest<Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>> {}
export interface CreateProductResponse extends POSResponse<Product> {}

export interface UpdateProductRequest extends POSRequest<Partial<Product> & { productId: string }> {}
export interface UpdateProductResponse extends POSResponse<Product> {}

export interface DeleteProductRequest extends POSRequest<{ productId: string }> {}
export interface DeleteProductResponse extends POSResponse<{ success: boolean }> {}

export interface GetInventoryRequest extends POSRequest<{ productId?: string; locationId?: string }> {}
export interface GetInventoryResponse extends POSResponse<InventoryItem[]> {}

export interface AdjustInventoryRequest extends POSRequest<{
  productId: string;
  locationId: string;
  quantity: number;
  reason: string;
  referenceId?: string;
}> {}
export interface AdjustInventoryResponse extends POSResponse<StockMovement> {}

export interface GetStockMovementsRequest extends POSRequest<{ productId?: string; locationId?: string } & PaginatedRequest> {}
export interface GetStockMovementsResponse extends POSResponse<PaginatedResponse<{ items: StockMovement[]; totalCount: number }>> {}

// Order requests
export interface CreateOrderRequest extends POSRequest<Omit<Order, 'orderId' | 'createdAt' | 'updatedAt' | 'completedAt'>> {}
export interface CreateOrderResponse extends POSResponse<Order> {}

export interface GetOrderRequest extends POSRequest<{ orderId: string }> {}
export interface GetOrderResponse extends POSResponse<Order> {}

export interface UpdateOrderRequest extends POSRequest<Partial<Order> & { orderId: string }> {}
export interface UpdateOrderResponse extends POSResponse<Order> {}

export interface SearchOrdersRequest extends POSRequest<OrderSearchCriteria & PaginatedRequest> {}
export interface SearchOrdersResponse extends POSResponse<PaginatedResponse<OrderSearchResult>> {}

export interface AddOrderItemRequest extends POSRequest<{ orderId: string; item: Omit<Order['items'][0], 'lineId'> }> {}
export interface AddOrderItemResponse extends POSResponse<Order> {}

export interface UpdateOrderItemRequest extends POSRequest<{ orderId: string; lineId: string; updates: Partial<Order['items'][0]> }> {}
export interface UpdateOrderItemResponse extends POSResponse<Order> {}

export interface RemoveOrderItemRequest extends POSRequest<{ orderId: string; lineId: string }> {}
export interface RemoveOrderItemResponse extends POSResponse<Order> {}

export interface VoidOrderItemRequest extends POSRequest<{ orderId: string; lineId: string; reason: string }> {}
export interface VoidOrderItemResponse extends POSResponse<Order> {}

export interface ApplyOrderDiscountRequest extends POSRequest<{ orderId: string; discountPercent: number; reason?: string }> {}
export interface ApplyOrderDiscountResponse extends POSResponse<Order> {}

export interface ProcessPaymentRequest extends POSRequest<{
  orderId: string;
  payment: Omit<Payment, 'paymentId' | 'processedAt' | 'authorizedAt' | 'capturedAt' | 'refundedAt' | 'refundAmount'>;
}> {}
export interface ProcessPaymentResponse extends POSResponse<Order> {}

export interface RefundPaymentRequest extends POSRequest<{
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
}> {}
export interface RefundPaymentResponse extends POSResponse<Order> {}

export interface CompleteOrderRequest extends POSRequest<{ orderId: string }> {}
export interface CompleteOrderResponse extends POSResponse<Order> {}

export interface CancelOrderRequest extends POSRequest<{ orderId: string; reason: string }> {}
export interface CancelOrderResponse extends POSResponse<Order> {}

// Receipt requests
export interface PrintReceiptRequest extends POSRequest<{
  orderId: string;
  type: Receipt['type'];
  options?: ReceiptPrintOptions;
}> {}
export interface PrintReceiptResponse extends POSResponse<Receipt> {}

export interface ReprintReceiptRequest extends POSRequest<{
  receiptId: string;
  options?: ReceiptPrintOptions;
}> {}
export interface ReprintReceiptResponse extends POSResponse<Receipt> {}

export interface GetReceiptRequest extends POSRequest<{ receiptId: string }> {}
export interface GetReceiptResponse extends POSResponse<Receipt> {}

// Shift requests
export interface OpenShiftRequest extends POSRequest<ShiftOpenRequest> {}
export interface OpenShiftResponse extends POSResponse<Shift> {}

export interface CloseShiftRequest extends POSRequest<ShiftCloseRequest> {}
export interface CloseShiftResponse extends POSResponse<Shift> {}

export interface ReconcileShiftRequest extends POSRequest<ShiftCloseRequest> {}
export interface ReconcileShiftResponse extends POSResponse<Shift> {}

export interface GetShiftRequest extends POSRequest<{ shiftId: string }> {}
export interface GetShiftResponse extends POSResponse<Shift> {}

export interface GetCurrentShiftRequest extends POSRequest<{ registerId: string }> {}
export interface GetCurrentShiftResponse extends POSResponse<Shift | null> {}

export interface SearchShiftsRequest extends POSRequest<ShiftSearchCriteria & PaginatedRequest> {}
export interface SearchShiftsResponse extends POSResponse<PaginatedResponse<ShiftSearchResult>> {}

// Register requests
export interface GetRegisterRequest extends POSRequest<{ registerId: string }> {}
export interface GetRegisterResponse extends POSResponse<Register> {}

export interface SearchRegistersRequest extends POSRequest<RegisterSearchCriteria & PaginatedRequest> {}
export interface SearchRegistersResponse extends POSResponse<PaginatedResponse<RegisterSearchResult>> {}

export interface UpdateRegisterStatusRequest extends POSRequest<{ registerId: string; status: Register['status'] }> {}
export interface UpdateRegisterStatusResponse extends POSResponse<Register> {}

export interface RegisterHeartbeatRequest extends POSRequest<{ registerId: string; status: Register['status']; peripherals: Record<string, boolean> }> {}
export interface RegisterHeartbeatResponse extends POSResponse<{ success: boolean }> {}

// Employee requests
export interface AuthenticateEmployeeRequest extends POSRequest<EmployeeAuthRequest> {}
export interface AuthenticateEmployeeResponse extends POSResponse<EmployeeAuthResponse> {}

export interface GetEmployeeRequest extends POSRequest<{ employeeId: string }> {}
export interface GetEmployeeResponse extends POSResponse<Employee> {}

export interface SearchEmployeesRequest extends POSRequest<EmployeeSearchCriteria & PaginatedRequest> {}
export interface SearchEmployeesResponse extends POSResponse<PaginatedResponse<EmployeeSearchResult>> {}

export interface CreateEmployeeRequest extends POSRequest<Omit<Employee, 'employeeId' | 'createdAt' | 'updatedAt' | 'lastLogin'>> {}
export interface CreateEmployeeResponse extends POSResponse<Employee> {}

export interface UpdateEmployeeRequest extends POSRequest<Partial<Employee> & { employeeId: string }> {}
export interface UpdateEmployeeResponse extends POSResponse<Employee> {}

export interface DeleteEmployeeRequest extends POSRequest<{ employeeId: string }> {}
export interface DeleteEmployeeResponse extends POSResponse<{ success: boolean }> {}