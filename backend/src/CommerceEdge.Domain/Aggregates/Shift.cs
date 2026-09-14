using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Entities;
using CommerceEdge.Domain.Enums;
using CommerceEdge.Domain.Events;
using CommerceEdge.Domain.Exceptions;
using CommerceEdge.Domain.ValueObjects;

namespace CommerceEdge.Domain.Aggregates;

public sealed class Shift : AggregateRoot
{
    private readonly List<Transaction> _transactions = [];

    public Guid StoreId { get; private set; }
    public Guid RegisterId { get; private set; }
    public Guid EmployeeId { get; private set; }
    public ShiftStatus Status { get; private set; }
    public Money OpeningFloat { get; private set; }
    public Money? ClosingFloat { get; private set; }
    public DateTime OpenedAt { get; private set; }
    public DateTime? ClosedAt { get; private set; }
    public IReadOnlyList<Transaction> Transactions => _transactions.AsReadOnly();

    private Shift() { OpeningFloat = default!; }

    public static Shift Open(Guid storeId, Guid registerId, Guid employeeId, Money openingFloat)
    {
        var shift = new Shift
        {
            StoreId = storeId,
            RegisterId = registerId,
            EmployeeId = employeeId,
            OpeningFloat = openingFloat,
            Status = ShiftStatus.Open,
            OpenedAt = DateTime.UtcNow
        };
        shift.Raise(new ShiftOpenedEvent(shift.Id, storeId, registerId, employeeId));
        return shift;
    }

    public Transaction AddTransaction(TransactionType type, Money amount, Guid? orderId = null)
    {
        if (Status != ShiftStatus.Open) { throw new DomainException("Shift is not open."); }
        var transaction = Transaction.Create(Id, type, amount, orderId);
        _transactions.Add(transaction);
        return transaction;
    }

    public void Close(Money closingFloat)
    {
        if (Status != ShiftStatus.Open) { throw new DomainException("Shift is not open."); }
        ClosingFloat = closingFloat;
        ClosedAt = DateTime.UtcNow;
        Status = ShiftStatus.Closed;
        Raise(new ShiftClosedEvent(Id, StoreId, RegisterId));
    }
}
