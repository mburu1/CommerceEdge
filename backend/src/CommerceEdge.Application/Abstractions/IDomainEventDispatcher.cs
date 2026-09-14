using CommerceEdge.Domain.Common;

namespace CommerceEdge.Application.Abstractions;

public interface IDomainEventDispatcher
{
    Task DispatchAsync(IEnumerable<IDomainEvent> events, CancellationToken ct = default);
}
