using CommerceEdge.CommerceRuntime.Handlers;
using CommerceEdge.CommerceRuntime.Requests;
using CommerceEdge.CommerceRuntime.Responses;
using CommerceEdge.CommerceRuntime.Services;
using CommerceEdge.Observability;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System.Diagnostics;

namespace CommerceEdge.CommerceRuntime.Tests.Services;

public class CommerceRuntimeServiceTests
{
    [Fact]
    public async Task ExecuteAsync_WhenHandlerRuns_CreatesTelemetryActivity()
    {
        var handler = new TestHandler();
        var services = new TestServiceProvider(handler);
        var runtime = new CommerceRuntimeService(services, NullLogger<CommerceRuntimeService>.Instance);
        var activities = new List<Activity>();
        using var listener = new ActivityListener
        {
            ShouldListenTo = source => source.Name == CommerceEdgeTelemetry.ActivitySourceName,
            Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllDataAndRecorded,
            ActivityStopped = activities.Add
        };

        ActivitySource.AddActivityListener(listener);

        using var parent = new Activity("test-parent").Start();
        var response = await runtime.ExecuteAsync<TestRequest, TestResponse>(
            new TestRequest(),
            TestContext.Current.CancellationToken);

        response.Success.Should().BeTrue();
        activities.Should().Contain(activity =>
            activity.DisplayName == "CommerceEdge.commerce_runtime.execute"
            && activity.ParentSpanId == parent.SpanId);
    }

    private sealed record TestRequest : CommerceRequest;

    private sealed record TestResponse : CommerceResponse;

    private sealed class TestHandler : ICommerceRequestHandler<TestRequest, TestResponse>
    {
        public Task<TestResponse> HandleAsync(TestRequest request, CancellationToken ct = default) =>
            Task.FromResult(new TestResponse { RequestId = request.RequestId, Success = true });
    }

    private sealed class TestServiceProvider(object service) : IServiceProvider
    {
        public object? GetService(Type serviceType) =>
            serviceType == typeof(ICommerceRequestHandler<TestRequest, TestResponse>) ? service : null;
    }
}
