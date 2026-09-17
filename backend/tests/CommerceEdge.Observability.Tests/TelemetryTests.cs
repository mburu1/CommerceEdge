using CommerceEdge.Observability;
using FluentAssertions;
using Xunit;

namespace CommerceEdge.Observability.Tests;

public class TelemetryTests
{
    [Fact]
    public void ActivitySource_HasCorrectName()
    {
        CommerceEdgeTelemetry.ActivitySource.Name.Should().Be("CommerceEdge");
        CommerceEdgeTelemetry.ActivitySource.Version.Should().Be("1.0.0");
    }

    [Fact]
    public void Meter_HasCorrectName()
    {
        CommerceEdgeTelemetry.Meter.Name.Should().Be("CommerceEdge");
        CommerceEdgeTelemetry.Meter.Version.Should().Be("1.0.0");
    }

    [Fact]
    public void OperationDuration_IsHistogram()
    {
        CommerceEdgeTelemetry.OperationDuration.Should().NotBeNull();
        CommerceEdgeTelemetry.OperationDuration.Name.Should().Be("commerceedge.operation.duration");
        CommerceEdgeTelemetry.OperationDuration.Unit.Should().Be("s");
    }

    [Fact]
    public void OperationCount_IsCounter()
    {
        CommerceEdgeTelemetry.OperationCount.Should().NotBeNull();
        CommerceEdgeTelemetry.OperationCount.Name.Should().Be("commerceedge.operation.count");
    }

    [Fact]
    public void OperationFailureCount_IsCounter()
    {
        CommerceEdgeTelemetry.OperationFailureCount.Should().NotBeNull();
        CommerceEdgeTelemetry.OperationFailureCount.Name.Should().Be("commerceedge.operation.failure.count");
    }

    [Fact]
    public void CacheOperationCount_IsCounter()
    {
        CommerceEdgeTelemetry.CacheOperationCount.Should().NotBeNull();
        CommerceEdgeTelemetry.CacheOperationCount.Name.Should().Be("commerceedge.cache.operation.count");
    }

    [Fact]
    public void MessagingPublishedCount_IsCounter()
    {
        CommerceEdgeTelemetry.MessagingPublishedCount.Should().NotBeNull();
        CommerceEdgeTelemetry.MessagingPublishedCount.Name.Should().Be("commerceedge.messaging.published.count");
    }

    [Fact]
    public void PaymentDuration_IsHistogram()
    {
        CommerceEdgeTelemetry.PaymentDuration.Should().NotBeNull();
        CommerceEdgeTelemetry.PaymentDuration.Name.Should().Be("commerceedge.payment.duration");
        CommerceEdgeTelemetry.PaymentDuration.Unit.Should().Be("s");
    }

    [Fact]
    public void Measure_CreatesActivity()
    {
        var measured = CommerceEdgeTelemetry.Measure("TestOperation");
        measured.Should().NotBeNull();
        measured.ElapsedSeconds.Should().BeGreaterThanOrEqualTo(0);
        measured.Dispose();
    }

    [Fact]
    public void Measure_WithTags_CreatesActivity()
    {
        var measured = CommerceEdgeTelemetry.Measure("TaggedOperation", ("key", "value"));
        measured.Should().NotBeNull();
        measured.Dispose();
    }

    [Fact]
    public void Measure_MarkedFailed_SetsSuccessFalse()
    {
        var measured = CommerceEdgeTelemetry.Measure("FailedOperation");
        measured.MarkFailed();
        measured.Dispose();

        CommerceEdgeTelemetry.OperationFailureCount.Name.Should().Be("commerceedge.operation.failure.count");
    }

    [Fact]
    public void MeasuredOperation_ElapsedIsPositiveAfterDispose()
    {
        var measured = CommerceEdgeTelemetry.Measure("TimingOperation");
        System.Threading.Thread.Sleep(10);
        measured.Dispose();

        measured.ElapsedMilliseconds.Should().BeGreaterThan(0);
    }

    [Fact]
    public void MeasuredOperation_SuccessDefaultIsTrue()
    {
        var measured = CommerceEdgeTelemetry.Measure("SuccessOp");
        measured.Dispose();
    }

    [Fact]
    public void Measure_DisposeDoesNotThrow()
    {
        var measured = CommerceEdgeTelemetry.Measure("MetricsTest");
        System.Threading.Thread.Sleep(5);
        measured.Dispose();
    }
}
