using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Serilog.Context;

namespace CommerceEdge.Observability.AspNetCore;

public sealed class CorrelationIdMiddleware(
    RequestDelegate next,
    IOptions<ObservabilityOptions> options)
{
    public const string ItemKey = "CommerceEdge.CorrelationId";

    public async Task InvokeAsync(HttpContext context)
    {
        var headerName = string.IsNullOrWhiteSpace(options.Value.CorrelationIdHeaderName)
            ? "X-Correlation-ID"
            : options.Value.CorrelationIdHeaderName;
        var incoming = context.Request.Headers[headerName].FirstOrDefault();
        var correlationId = IsValidCorrelationId(incoming)
            ? incoming!
            : Guid.NewGuid().ToString("N");

        context.Items[ItemKey] = correlationId;
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[headerName] = correlationId;
            if (Activity.Current is not null)
            {
                context.Response.Headers["Trace-Id"] = Activity.Current.TraceId.ToHexString();
            }

            return Task.CompletedTask;
        });

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await next(context);
        }
    }

    private static bool IsValidCorrelationId(string? value) =>
        !string.IsNullOrWhiteSpace(value)
        && value.Length <= 128
        && value.All(character =>
            char.IsAsciiLetterOrDigit(character) || character is '-' or '_');

    public static string GetCorrelationId(HttpContext context) =>
        context.Items.TryGetValue(ItemKey, out var value) ? value as string ?? string.Empty : string.Empty;
}
