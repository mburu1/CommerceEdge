using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Entities;

public sealed class OrderLine : Entity
{
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public Guid? VariantId { get; private set; }
    public string ProductName { get; private set; }
    public string Sku { get; private set; }
    public Money UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public Money LineTotal => UnitPrice.Multiply(Quantity);
    public OrderLineStatus Status { get; private set; }

    private OrderLine() { ProductName = default!; Sku = default!; UnitPrice = default!; }

    internal static OrderLine Create(Guid orderId, Guid productId, Guid? variantId, string productName, string sku, Money unitPrice, int quantity)
    {
        if (quantity <= 0) { throw new DomainException("Quantity must be positive."); }
        return new OrderLine
        {
            OrderId = orderId, ProductId = productId, VariantId = variantId,
            ProductName = productName, Sku = sku, UnitPrice = unitPrice,
            Quantity = quantity, Status = OrderLineStatus.Active
        };
    }

    public void Cancel() => Status = OrderLineStatus.Cancelled;
    public void Return() => Status = OrderLineStatus.Returned;
}
