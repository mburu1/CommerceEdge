using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Entities;

public sealed class Transaction : Entity
{
    public Guid ShiftId { get; private set; }
    public TransactionType Type { get; private set; }
    public Money Amount { get; private set; }
    public Guid? OrderId { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private Transaction() { Amount = default!; }

    internal static Transaction Create(Guid shiftId, TransactionType type, Money amount, Guid? orderId)
        => new() { ShiftId = shiftId, Type = type, Amount = amount, OrderId = orderId, CreatedAt = DateTime.UtcNow };
}
