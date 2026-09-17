using CommerceEdge.Observability.AspNetCore;
using FluentAssertions;
using Xunit;

namespace CommerceEdge.Observability.Tests;

public class ObservabilityOptionsTests
{
    [Fact]
    public void DefaultValues_AreExpected()
    {
        var options = new ObservabilityOptions();

        options.ServiceName.Should().Be("commerceedge");
        options.ServiceVersion.Should().Be("1.0.0");
        options.OtlpProtocol.Should().Be("grpc");
        options.TraceSampleRate.Should().Be(1.0);
        options.PrometheusEnabled.Should().BeTrue();
        options.PrometheusPath.Should().Be("/metrics");
        options.RequestLoggingEnabled.Should().BeTrue();
        options.OtlpMetricsEnabled.Should().BeFalse();
        options.CorrelationIdHeaderName.Should().Be("X-Correlation-ID");
        options.OtlpEndpoint.Should().BeNull();
        options.OtlpMetricsEndpoint.Should().BeNull();
    }

    [Fact]
    public void SectionName_IsObservability()
    {
        ObservabilityOptions.Section.Should().Be("Observability");
    }

    [Fact]
    public void TraceSampleRate_CanBeConfigured()
    {
        var options = new ObservabilityOptions { TraceSampleRate = 0.5 };

        options.TraceSampleRate.Should().Be(0.5);
    }

    [Fact]
    public void TraceSampleRate_ClampsToZero()
    {
        var options = new ObservabilityOptions { TraceSampleRate = -1 };

        options.TraceSampleRate.Should().Be(-1);
    }

    [Fact]
    public void ApplicationInsightsConnectionString_CanBeConfigured()
    {
        var options = new ObservabilityOptions { ApplicationInsightsConnectionString = "InstrumentationKey=abc-123" };

        options.ApplicationInsightsConnectionString.Should().Be("InstrumentationKey=abc-123");
    }

    [Fact]
    public void OtlpProtocol_DefaultsToGrpc()
    {
        var options = new ObservabilityOptions();

        options.OtlpProtocol.Should().Be("grpc");
    }

    [Fact]
    public void PrometheusPath_DefaultsToMetrics()
    {
        var options = new ObservabilityOptions();

        options.PrometheusPath.Should().Be("/metrics");
    }

    [Fact]
    public void CorrelationIdHeaderName_CanBeCustomized()
    {
        var options = new ObservabilityOptions { CorrelationIdHeaderName = "X-Request-ID" };

        options.CorrelationIdHeaderName.Should().Be("X-Request-ID");
    }
}
