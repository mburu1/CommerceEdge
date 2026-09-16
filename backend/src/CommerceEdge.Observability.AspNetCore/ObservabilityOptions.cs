namespace CommerceEdge.Observability.AspNetCore;

public sealed class ObservabilityOptions
{
    public const string Section = "Observability";

    public string ServiceName { get; set; } = "commerceedge";
    public string? ServiceVersion { get; set; } = "1.0.0";
    public string? OtlpEndpoint { get; set; }
    public string? OtlpMetricsEndpoint { get; set; }
    public bool OtlpMetricsEnabled { get; set; } = false;
    public string OtlpProtocol { get; set; } = "grpc";
    public double TraceSampleRate { get; set; } = 1.0;
    public bool PrometheusEnabled { get; set; } = true;
    public string PrometheusPath { get; set; } = "/metrics";
    public bool RequestLoggingEnabled { get; set; } = true;
    public string CorrelationIdHeaderName { get; set; } = "X-Correlation-ID";
}
