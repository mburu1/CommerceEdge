using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Entities;

public sealed class CartLine : Entity
{
    public Guid CartId { get; private set; }
    public Guid ProductId { get; private set; }
    public Guid? VariantId { get; private set; }
    public string ProductName { get; private set; }
    public string Sku { get; private set; }
    public Money UnitPrice { get; private set; }
    public int Quantity { get; private set; }
    public Money LineTotal => UnitPrice.Multiply(Quantity);

    private CartLine() { ProductName = default!; Sku = default!; UnitPrice = default!; }

    internal static CartLine Create(Guid cartId, Guid productId, Guid? variantId, string productName, string sku, Money unitPrice, int quantity)
    {
        if (quantity <= 0) { throw new DomainException("Quantity must be positive."); }
        return new CartLine
        {
            CartId = cartId, ProductId = productId, VariantId = variantId,
            ProductName = productName, Sku = sku, UnitPrice = unitPrice, Quantity = quantity
        };
    }

    internal void UpdateQuantity(int quantity)
    {
        if (quantity <= 0) { throw new DomainException("Quantity must be positive."); }
        Quantity = quantity;
    }
}
