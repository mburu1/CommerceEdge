namespace CommerceEdge.Domain.Enums;

public enum ChannelType { Store, OnlineStore, CallCenter }

public enum StoreStatus { Active, Inactive, Closed }

public enum RegisterStatus { Closed, Open, Suspended }

public enum ShiftStatus { Open, Suspended, Closed }

public enum ProductStatus { Active, Discontinued, Draft }

public enum InventoryStatus { Available, LowStock, OutOfStock }

public enum OrderStatus { Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Returned }

public enum OrderLineStatus { Active, Cancelled, Returned }

public enum PaymentStatus { Pending, Authorized, Captured, Voided, Refunded, Failed }

public enum PaymentMethod { Cash, Card, MobileMoney, GiftCard, LoyaltyPoints }

public enum CartStatus { Active, Abandoned, CheckedOut }

public enum CustomerStatus { Active, Inactive, Blocked }

public enum ReturnReason { Defective, WrongItem, NotAsDescribed, Changed, Other }

public enum TransactionType { Sale, Return, Exchange, Void }
