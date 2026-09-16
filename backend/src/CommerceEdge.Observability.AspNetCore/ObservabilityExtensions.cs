using CommerceEdge.Observability;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using OpenTelemetry.Exporter;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;
using Serilog.Formatting.Compact;

namespace CommerceEdge.Observability.AspNetCore;

public static class ObservabilityServiceCollectionExtensions
{
    public static IServiceCollection AddCommerceEdgeObservability(
        this IServiceCollection services,
        IConfiguration configuration,
        string serviceName)
    {
        var options = configuration.GetSection(ObservabilityOptions.Section).Get<ObservabilityOptions>()
                      ?? new ObservabilityOptions();
        options.ServiceName = serviceName;

        services.AddSingleton(options);
        services.AddOptions<ObservabilityOptions>()
            .Bind(configuration.GetSection(ObservabilityOptions.Section))
            .PostConfigure(configured => configured.ServiceName = serviceName);

        services.AddOpenTelemetry()
            .ConfigureResource(resource => resource.AddService(
                options.ServiceName,
                serviceVersion: options.ServiceVersion))
            .WithTracing(tracing =>
            {
                tracing.AddSource(CommerceEdgeTelemetry.ActivitySourceName);
                tracing.AddAspNetCoreInstrumentation(instrumentation =>
                    instrumentation.RecordException = true);
                tracing.AddHttpClientInstrumentation();
                tracing.AddSqlClientInstrumentation();

                if (!string.IsNullOrWhiteSpace(options.OtlpEndpoint))
                {
                    tracing.AddOtlpExporter(exporter => ConfigureOtlpExporter(exporter, options));
                }
            })
            .WithMetrics(metrics =>
            {
                metrics.AddMeter(CommerceEdgeTelemetry.MeterName);
                metrics.AddRuntimeInstrumentation();
                metrics.AddAspNetCoreInstrumentation();
                metrics.AddHttpClientInstrumentation();

                if (options.PrometheusEnabled)
                {
                    metrics.AddPrometheusExporter(exporter =>
                    {
                        exporter.ScrapeEndpointPath = options.PrometheusPath;
                        exporter.ScrapeResponseCacheDurationMilliseconds = 0;
                    });
                }

                if (!string.IsNullOrWhiteSpace(options.OtlpEndpoint))
                {
                    metrics.AddOtlpExporter(exporter => ConfigureOtlpExporter(exporter, options));
                }
            });

        return services;
    }

    public static IServiceCollection AddCommerceEdgeHealthChecks(
        this IServiceCollection services,
        Action<IHealthChecksBuilder>? configureDependencies = null)
    {
        var healthChecks = services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"]);

        configureDependencies?.Invoke(healthChecks);
        return services;
    }

    public static IHostBuilder UseCommerceEdgeSerilog(
        this IHostBuilder host,
        IConfiguration configuration,
        string serviceName)
    {
        host.UseSerilog((context, loggerConfiguration) =>
            loggerConfiguration
                .ReadFrom.Configuration(context.Configuration)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Service", serviceName)
                .Enrich.WithEnvironmentName()
                .Enrich.WithMachineName()
                .Enrich.WithProcessId()
                .Enrich.WithThreadId()
                .WriteTo.Console(new CompactJsonFormatter()));

        return host;
    }

    private static void ConfigureOtlpExporter(
        OtlpExporterOptions exporter,
        ObservabilityOptions options)
    {
        exporter.Endpoint = new Uri(options.OtlpEndpoint!);
        exporter.Protocol = options.OtlpProtocol.Equals("http/protobuf", StringComparison.OrdinalIgnoreCase)
            ? OtlpExportProtocol.HttpProtobuf
            : OtlpExportProtocol.Grpc;
    }
}

public static class ObservabilityApplicationBuilderExtensions
{
    public static IApplicationBuilder UseCommerceEdgeRequestObservability(
        this IApplicationBuilder application,
        IConfiguration configuration)
    {
        application.UseMiddleware<CorrelationIdMiddleware>();

        var options = configuration.GetSection(ObservabilityOptions.Section).Get<ObservabilityOptions>()
                      ?? new ObservabilityOptions();
        if (options.RequestLoggingEnabled)
        {
            application.UseSerilogRequestLogging(requestOptions =>
                requestOptions.MessageTemplate =
                    "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms");
        }

        return application;
    }
}

public static class ObservabilityEndpointRouteBuilderExtensions
{
    public static IEndpointRouteBuilder MapCommerceEdgeMetrics(
        this IEndpointRouteBuilder endpoints,
        ObservabilityOptions options)
    {
        if (options.PrometheusEnabled)
        {
            endpoints.MapPrometheusScrapingEndpoint(options.PrometheusPath);
        }

        return endpoints;
    }

    public static IEndpointRouteBuilder MapCommerceEdgeHealthChecks(
        this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapHealthChecks("/health", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("live")
        });

        endpoints.MapHealthChecks("/health/ready", new HealthCheckOptions
        {
            Predicate = check => check.Tags.Contains("ready")
        });

        return endpoints;
    }
}
