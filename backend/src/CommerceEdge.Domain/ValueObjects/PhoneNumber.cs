using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Exceptions;

namespace CommerceEdge.Domain.ValueObjects;

public sealed class PhoneNumber : ValueObject
{
    public string Value { get; }

    public PhoneNumber(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException("Phone number is required.");
        }
        Value = value.Trim();
    }

    protected override IEnumerable<object?> GetEqualityComponents() { yield return Value; }

    public override string ToString() => Value;
}
