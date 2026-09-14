using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Events;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Aggregates;

public sealed class InventoryItem : AggregateRoot
{
    public Guid ProductId { get; private set; }
    public Guid? VariantId { get; private set; }
    public Guid StoreId { get; private set; }
    public string Sku { get; private set; }
    public int QuantityOnHand { get; private set; }
    public int QuantityReserved { get; private set; }
    public int ReorderPoint { get; private set; }
    public InventoryStatus Status { get; private set; }

    public int QuantityAvailable => QuantityOnHand - QuantityReserved;

    private InventoryItem() { Sku = default!; }

    public static InventoryItem Create(Guid productId, Guid storeId, string sku, Guid? variantId = null, int reorderPoint = 5)
    {
        var item = new InventoryItem
        {
            ProductId = productId,
            StoreId = storeId,
            Sku = sku.ToUpperInvariant(),
            VariantId = variantId,
            QuantityOnHand = 0,
            QuantityReserved = 0,
            ReorderPoint = reorderPoint,
            Status = InventoryStatus.OutOfStock
        };
        return item;
    }

    public void Receive(int quantity)
    {
        if (quantity <= 0) { throw new DomainException("Receive quantity must be positive."); }
        QuantityOnHand += quantity;
        UpdateStatus();
        Raise(new InventoryReceivedEvent(Id, Sku, quantity, QuantityOnHand));
    }

    public void Reserve(int quantity)
    {
        if (quantity > QuantityAvailable)
        {
            throw new DomainException($"Insufficient stock. Available: {QuantityAvailable}, Requested: {quantity}.");
        }
        QuantityReserved += quantity;
        UpdateStatus();
        Raise(new InventoryReservedEvent(Id, Sku, quantity));
    }

    public void ReleaseReservation(int quantity)
    {
        QuantityReserved = Math.Max(0, QuantityReserved - quantity);
        UpdateStatus();
    }

    public void Adjust(int quantity, string reason)
    {
        QuantityOnHand = Math.Max(0, QuantityOnHand + quantity);
        UpdateStatus();
        Raise(new InventoryAdjustedEvent(Id, Sku, quantity, reason));
    }

    private void UpdateStatus()
    {
        Status = QuantityAvailable switch
        {
            0 => InventoryStatus.OutOfStock,
            <= 5 => InventoryStatus.LowStock,
            _ => InventoryStatus.Available
        };
    }
}
