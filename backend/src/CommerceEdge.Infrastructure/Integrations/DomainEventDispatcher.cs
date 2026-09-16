using CommerceEdge.Application.Abstractions;
using CommerceEdge.Domain.Common;
using Microsoft.Extensions.Logging;

namespace CommerceEdge.Infrastructure.Integrations;

/// <summary>
/// Bridges persistence-domain events to the external messaging subsystem.
/// Each event raised by an aggregate is published through <see cref="IEventPublisher"/>
/// so interested downstream systems (and the read model) can react.
/// </summary>
public sealed class DomainEventDispatcher : IDomainEventDispatcher
{
    private readonly IEventPublisher _publisher;
    private readonly ILogger<DomainEventDispatcher> _logger;

    public DomainEventDispatcher(IEventPublisher publisher, ILogger<DomainEventDispatcher> logger)
    {
        _publisher = publisher;
        _logger = logger;
    }

    public async Task DispatchAsync(IEnumerable<IDomainEvent> events, CancellationToken ct = default)
    {
        foreach (var evt in events)
        {
            // Publish as the runtime type so the JSON payload carries the event's properties.
            await _publisher.PublishAsync((object)evt, ct);
            _logger.LogTrace("Dispatched domain event {EventId} ({EventType})", evt.EventId, evt.GetType().Name);
        }
    }
}
