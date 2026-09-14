using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Entities;

public sealed class Payment : Entity
{
    public Guid OrderId { get; private set; }
    public PaymentMethod Method { get; private set; }
    public Money Amount { get; private set; }
    public PaymentStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Payment() { Amount = default!; }

    internal static Payment Create(Guid orderId, PaymentMethod method, Money amount)
        => new() { OrderId = orderId, Method = method, Amount = amount, Status = PaymentStatus.Pending, CreatedAt = DateTime.UtcNow };

    public void Capture() => Status = PaymentStatus.Captured;
    public void Void() => Status = PaymentStatus.Voided;
    public void Fail() => Status = PaymentStatus.Failed;
    public void Refund() => Status = PaymentStatus.Refunded;
}
