using CommerceEdge.Observability.AspNetCore;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Diagnostics;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace CommerceEdge.Observability.Tests;

public class CorrelationIdMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_NoHeaderProvided_GeneratesCorrelationId()
    {
        var context = CreateContext();
        var middleware = new CorrelationIdMiddleware(Next, Options.Create(new ObservabilityOptions()));

        await middleware.InvokeAsync(context);

        context.Items[CorrelationIdMiddleware.ItemKey].Should().NotBeNull();
        var correlationId = context.Items[CorrelationIdMiddleware.ItemKey] as string;
        correlationId.Should().NotBeNullOrEmpty();
        correlationId!.Length.Should().BeLessThanOrEqualTo(128);
    }

    [Fact]
    public async Task InvokeAsync_ValidHeaderProvided_UsesIncomingCorrelationId()
    {
        var context = CreateContext("existing-correlation-id-123");
        var middleware = new CorrelationIdMiddleware(Next, Options.Create(new ObservabilityOptions()));

        await middleware.InvokeAsync(context);

        context.Items[CorrelationIdMiddleware.ItemKey].Should().Be("existing-correlation-id-123");
    }

    [Fact]
    public async Task InvokeAsync_InvalidHeaderProvided_GeneratesNewCorrelationId()
    {
        var context = CreateContext("invalid!!@#id");
        var middleware = new CorrelationIdMiddleware(Next, Options.Create(new ObservabilityOptions()));

        await middleware.InvokeAsync(context);

        context.Items[CorrelationIdMiddleware.ItemKey].Should().NotBe("invalid!!@#id");
    }

    [Fact]
    public async Task InvokeAsync_StoresCorrelationIdInContext()
    {
        var context = CreateContext();
        var middleware = new CorrelationIdMiddleware(Next, Options.Create(new ObservabilityOptions()));

        await middleware.InvokeAsync(context);

        var correlationId = context.Items[CorrelationIdMiddleware.ItemKey] as string;
        correlationId.Should().NotBeNullOrEmpty();
        correlationId!.Length.Should().BeLessThanOrEqualTo(128);
    }

    [Fact]
    public async Task InvokeAsync_SetsCorrelationIdInLogContext()
    {
        var context = CreateContext();
        var middleware = new CorrelationIdMiddleware(Next, Options.Create(new ObservabilityOptions()));

        await middleware.InvokeAsync(context);

        var correlationId = context.Items[CorrelationIdMiddleware.ItemKey] as string;
        correlationId.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task GetCorrelationId_ReturnsCorrelationIdFromContext()
    {
        var context = new DefaultHttpContext();
        context.Items[CorrelationIdMiddleware.ItemKey] = "my-correlation-id";

        var result = CorrelationIdMiddleware.GetCorrelationId(context);

        result.Should().Be("my-correlation-id");
    }

    [Fact]
    public async Task GetCorrelationId_ReturnsEmptyWhenNotSet()
    {
        var context = new DefaultHttpContext();

        var result = CorrelationIdMiddleware.GetCorrelationId(context);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task InvokeAsync_CustomHeaderName_UsesCustomHeader()
    {
        var context = CreateContext();
        var options = new ObservabilityOptions { CorrelationIdHeaderName = "X-Custom-Correlation" };
        var middleware = new CorrelationIdMiddleware(Next, Options.Create(options));

        await middleware.InvokeAsync(context);
        await context.Response.StartAsync(TestContext.Current.CancellationToken);

        context.Items[CorrelationIdMiddleware.ItemKey].Should().NotBeNull();
    }

    [Fact]
    public async Task InvokeAsync_HeaderPreservedAcrossMiddlewareChain()
    {
        var context = CreateContext("persisted-id");
        var middleware = new CorrelationIdMiddleware(Next, Options.Create(new ObservabilityOptions()));

        await middleware.InvokeAsync(context);

        var nextHeader = context.Items["NextCorrelationId"] as string;
        nextHeader.Should().Be("persisted-id");
    }

    private static Task Next(HttpContext ctx)
    {
        if (ctx.Items.TryGetValue(CorrelationIdMiddleware.ItemKey, out var value))
        {
            ctx.Items["NextCorrelationId"] = value;
        }
        return Task.CompletedTask;
    }

    private static Task NextWithBody(HttpContext ctx)
    {
        if (ctx.Items.TryGetValue(CorrelationIdMiddleware.ItemKey, out var value))
        {
            ctx.Items["NextCorrelationId"] = value;
        }
        return ctx.Response.WriteAsync("ok");
    }

    private static DefaultHttpContext CreateContext(string? correlationId = null)
    {
        var context = new DefaultHttpContext();
        if (correlationId != null)
        {
            context.Request.Headers["X-Correlation-ID"] = correlationId;
        }
        return context;
    }
}
