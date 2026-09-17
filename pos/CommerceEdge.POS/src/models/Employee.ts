export interface Employee {
  employeeId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: EmployeeRole;
  permissions: Permission[];
  storeId: string;
  registerIds: string[];
  isActive: boolean;
  hireDate: Date;
  terminationDate?: Date;
  lastLogin?: Date;
  pinHash?: string;
  biometricEnabled: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EmployeeRole = 
  | 'cashier' 
  | 'senior_cashier' 
  | 'shift_supervisor' 
  | 'assistant_manager' 
  | 'store_manager' 
  | 'district_manager' 
  | 'system_admin';

export interface Permission {
  permissionId: string;
  name: string;
  description: string;
  category: PermissionCategory;
  resource: string;
  actions: PermissionAction[];
}

export type PermissionCategory = 
  | 'sales' 
  | 'returns' 
  | 'discounts' 
  | 'voids' 
  | 'payments' 
  | 'shifts' 
  | 'reports' 
  | 'inventory' 
  | 'customers' 
  | 'employees' 
  | 'registers' 
  | 'settings' 
  | 'admin';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'override';

export interface EmployeeSearchCriteria {
  storeId?: string;
  role?: EmployeeRole;
  isActive?: boolean;
  query?: string;
  page?: number;
  pageSize?: number;
}

export interface EmployeeSearchResult {
  employees: Employee[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface EmployeeAuthRequest {
  employeeId: string;
  pin: string;
  registerId: string;
}

export interface EmployeeAuthResponse {
  success: boolean;
  employee?: Employee;
  token?: string;
  expiresAt?: Date;
  message?: string;
  requiresBiometric?: boolean;
}