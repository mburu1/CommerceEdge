using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Exceptions;

namespace CommerceEdge.Domain.ValueObjects;

public sealed class Quantity : ValueObject
{
    public int Value { get; }

    public Quantity(int value)
    {
        if (value < 0) { throw new DomainException("Quantity cannot be negative."); }
        Value = value;
    }

    public Quantity Add(Quantity other) => new(Value + other.Value);
    public Quantity Subtract(Quantity other) => new(Value - other.Value);

    public static Quantity Zero => new(0);

    protected override IEnumerable<object?> GetEqualityComponents() { yield return Value; }

    public override string ToString() => Value.ToString();
}
