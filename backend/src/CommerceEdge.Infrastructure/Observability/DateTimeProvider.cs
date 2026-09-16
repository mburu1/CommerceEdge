using CommerceEdge.Application.Abstractions;

namespace CommerceEdge.Infrastructure.Observability;

/// <summary>
/// Production <see cref="IDateTimeProvider"/> backed by the system clock.
/// </summary>
public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
