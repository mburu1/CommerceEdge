using CommerceEdge.Domain.Common;

namespace CommerceEdge.Domain.Events;

public sealed record InventoryReceivedEvent(Guid InventoryItemId, string Sku, int Quantity, int NewOnHand) : DomainEvent;
public sealed record InventoryReservedEvent(Guid InventoryItemId, string Sku, int Quantity) : DomainEvent;
public sealed record InventoryAdjustedEvent(Guid InventoryItemId, string Sku, int Adjustment, string Reason) : DomainEvent;
