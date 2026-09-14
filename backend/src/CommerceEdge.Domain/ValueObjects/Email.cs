using CommerceEdge.Domain.Common;
using CommerceEdge.Domain.Exceptions;

namespace CommerceEdge.Domain.ValueObjects;

public sealed class Email : ValueObject
{
    public string Value { get; }

    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.Contains('@'))
        {
            throw new DomainException("Invalid email address.");
        }
        Value = value.ToLowerInvariant();
    }

    protected override IEnumerable<object?> GetEqualityComponents() { yield return Value; }

    public override string ToString() => Value;
}
