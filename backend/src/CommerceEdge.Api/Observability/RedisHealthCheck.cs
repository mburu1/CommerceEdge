using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

namespace CommerceEdge.Api.Observability;

public sealed class RedisHealthCheck(IConnectionMultiplexer multiplexer) : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(multiplexer.IsConnected
            ? HealthCheckResult.Healthy("Redis is reachable.")
            : HealthCheckResult.Unhealthy("Redis is unavailable."));
    }
}
