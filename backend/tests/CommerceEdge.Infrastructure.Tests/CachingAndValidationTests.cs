using CommerceEdge.Infrastructure.Caching;
using CommerceEdge.Application.Abstractions;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace CommerceEdge.Infrastructure.Tests;

public class CachingServiceTests
{
    [Fact]
    public async Task Cache_SetAndGet_ReturnsValue()
    {
        var cache = new SimpleCacheService();
        await cache.SetAsync("key", "value", TimeSpan.FromMinutes(5));
        var result = await cache.GetAsync<string>("key");

        result.Should().Be("value");
    }

    [Fact]
    public async Task Cache_GetMissingKey_ReturnsNull()
    {
        var cache = new SimpleCacheService();
        var result = await cache.GetAsync<string>("missing");

        result.Should().BeNull();
    }

    [Fact]
    public async Task Cache_Remove_RemovesKey()
    {
        var cache = new SimpleCacheService();
        await cache.SetAsync("key", "value");
        await cache.RemoveAsync("key");
        var result = await cache.GetAsync<string>("key");

        result.Should().BeNull();
    }
}

public class ValidationBehaviorTests
{
    [Fact]
    public void ValidationBehavior_WithNoValidators_DoesNotThrow()
    {
        var validators = Array.Empty<IValidator<object>>();
        var behavior = new CommerceEdge.Application.Behaviors.ValidationBehavior<object>(validators);

        var result = behavior.ValidateAsync(new object(), default);

        result.Should().NotBeNull();
    }
}
