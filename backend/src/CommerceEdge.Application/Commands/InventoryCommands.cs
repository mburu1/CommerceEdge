namespace CommerceEdge.Application.Commands;

public record CreateInventoryItemCommand(
    Guid ProductId,
    Guid StoreId,
    string Sku,
    Guid? VariantId,
    int ReorderPoint);

public record ReceiveInventoryCommand(Guid InventoryItemId, int Quantity);

public record ReserveInventoryCommand(Guid InventoryItemId, int Quantity);

public record ReleaseInventoryReservationCommand(Guid InventoryItemId, int Quantity);

public record AdjustInventoryCommand(Guid InventoryItemId, int Quantity, string Reason);
