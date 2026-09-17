using CommerceEdge.Api.Observability;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace CommerceEdge.Observability.Tests;

public class HealthCheckTests
{
    [Fact]
    public async Task RedisHealthCheck_ReturnsHealthy_WhenRedisConnected()
    {
        var multiplexer = Substitute.For<IConnectionMultiplexer>();
        multiplexer.IsConnected.Returns(true);

        var check = new RedisHealthCheck(multiplexer);

        var result = await check.CheckHealthAsync(
            new HealthCheckContext(),
            CancellationToken.None);

        result.Status.Should().Be(HealthStatus.Healthy);
        result.Description.Should().Contain("Redis");
    }

    [Fact]
    public async Task RedisHealthCheck_ReturnsUnhealthy_WhenRedisDisconnected()
    {
        var multiplexer = Substitute.For<IConnectionMultiplexer>();
        multiplexer.IsConnected.Returns(false);

        var check = new RedisHealthCheck(multiplexer);

        var result = await check.CheckHealthAsync(
            new HealthCheckContext(),
            CancellationToken.None);

        result.Status.Should().Be(HealthStatus.Unhealthy);
        result.Description.Should().Contain("unavailable");
    }

    [Fact]
    public void RedisHealthCheck_TakesMultiplexerAsConstructorDependency()
    {
        var multiplexer = Substitute.For<IConnectionMultiplexer>();

        Action createCheck = () => new RedisHealthCheck(multiplexer);

        createCheck.Should().NotThrow();
    }
}
