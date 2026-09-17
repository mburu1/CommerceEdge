using CommerceEdge.Application.Abstractions;

namespace CommerceEdge.Infrastructure.Observability;

public sealed class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
